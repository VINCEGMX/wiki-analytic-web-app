var mongoose = require('./database')
var fs = require('fs')
var Promise = require('bluebird');
var readline = require('readline')
var request = require('request')
var bcrypt = require('bcrypt')

const saltRounds = 10;

Promise.promisifyAll(fs);

var RevisionSchema = new mongoose.Schema(
    {
      revid: Number,
      parentid: Number,
      minor: String,
      user: String,
      anon: String,
      userid: Number,
      timestamp: Date,
      size: Number,
      sha1: String,
      parsedcomment:String,
      title: String,
      usertype: String
    },
    {
      versionKey: false
    });



//Overall analytics
RevisionSchema.statics.showExNumArticle = function(options,callback){
  var pipeline = [
    {$group:{_id: "$title", count: {$sum:1}}},
    {$sort: {count:parseInt(options.sort)}},
    {$limit:parseInt(options.limit)}
  ]
  return this.aggregate(pipeline).exec(callback)
}

RevisionSchema.statics.showExRegArticle = function(options,callback){
  var pipeline = [
    {$match:{usertype:{$in:['admin','regular']}}},
    {$group:{_id: "$title", users: {$addToSet:"$user"}}},
    {$project:{_id:1, groupSize:{$size:"$users"}}},
    {$sort: {groupSize:parseInt(options.sort)}},
    {$limit:parseInt(options.limit)}
  ]
  return this.aggregate(pipeline).exec(callback)
}

RevisionSchema.statics.showExHisArticle = function(options,callback){
  var pipeline = [
    {$group:{_id: "$title", minTime:{$min:"$timestamp"}}},
    {$project:{_id:1, age:{$toInt:{$divide:[{$subtract:["$$NOW", "$minTime"]}, 86400000]}}}},
    {$sort: {age:parseInt(options.sort)}},
    {$limit:parseInt(options.limit)}
  ]
  return this.aggregate(pipeline).exec(callback)
}

RevisionSchema.statics.revsByUsertypeByYear = function(callback){
  var pipeline = [
    {$project:
      {
        year:{$year:"$timestamp"},
        admin:{$cond:[{$eq:["$usertype", "admin"]},1,0]},
        bot:{$cond:[{$eq:["$usertype", "bot"]},1,0]},
        anon:{$cond:[{$eq:["$usertype", "anon"]},1,0]},
        regular:{$cond:[{$eq:["$usertype", "regular"]},1,0]}
      }
    },{
      $group:
        {
          _id:"$year",
          numOfAdmin:{$sum:"$admin"},
          numOfBot:{$sum:"$bot"},
          numOfAnon:{$sum:"$anon"},
          numOfRegular:{$sum:"$regular"}
        }   
      },
    {$sort:{_id:1}}
  ]
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.revDisByUsertype = function(callback){
  var pipeline = [
    {$group:{_id:"$usertype",count:{$sum:1}}}
  ]
  return this.aggregate(pipeline).exec(callback);
};


//Individual analytics
RevisionSchema.statics.totalRevAllTitle = function(fromYear,toYear,callback){
  var pipeline = [
    {$project:{title:1, year:{$year:"$timestamp"}}},
    {$match:{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}},
    {$group:{_id:"$title", count:{$sum:1}}},
    {$sort:{_id:1}}
  ];
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.totalRevTitle = function(title_search, fromYear,toYear,callback){
  var pipeline = [
    {$project:{title:1, year:{$year:"$timestamp"}}},
    {$match:{$and:[{title:title_search},{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}]}},
    {$group:{_id:"$title", count:{$sum:1}}}
  ];
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.topRegularUsers = function(fromYear,toYear,title_search,callback){
  var pipeline = [
    {$project:{title:1,usertype:1,user:1, year:{$year:"$timestamp"}}},
    {$match:{$and:[{title:title_search},{usertype:'regular'},{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}]}},
    {$group:{_id:"$user", count:{$sum:1}}},
    {$sort:{count:-1}},
    {$limit:5}
  ];
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.revDisByYearByUsertypeArticle = function(fromYear,toYear,title_search,callback){
  var pipeline = [
    {$match:{title:title_search}},
    {$project:
      {
        year:{$year:"$timestamp"},
        admin:{$cond:[{$eq:["$usertype", "admin"]},1,0]},
        bot:{$cond:[{$eq:["$usertype", "bot"]},1,0]},
        anon:{$cond:[{$eq:["$usertype", "anon"]},1,0]},
        regular:{$cond:[{$eq:["$usertype", "regular"]},1,0]}
      }
    },
    {$match:{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}},
    {$group:
      {
        _id:"$year",
        numOfAdmin:{$sum:"$admin"},
        numOfBot:{$sum:"$bot"},
        numOfAnon:{$sum:"$anon"},
        numOfRegular:{$sum:"$regular"}
      }   
    },
    {$sort:{_id:1}}
  ];
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.revDisByUsertypeArticle = function(fromYear,toYear,title_search,callback){
  var pipeline = [
    {$project:{title:1,usertype:1, year:{$year:"$timestamp"}}},
    {$match:{$and:[{title:title_search},{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}]}},
    {$group:{_id:"$usertype",count:{$sum:1}}}
  ]
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.revDisByYearTopRegUser = function(fromYear,toYear,title_search,user_search,callback){
  var pipeline = [
    {$project:{title:1,user:1, year:{$year:"$timestamp"}}},
    {$match:{$and:[{title:title_search},{user:user_search},{year:{$gte:parseInt(fromYear), $lte:parseInt(toYear)}}]}},
    {$group:{_id:"$year",count:{$sum:1}}},
    {$sort:{_id:1}}
  ]
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.lastTimeTitle = function(title_search,callback){
  var pipeline = [
    {$match:{title:title_search}},
    {$project:{timestamp:1}},
    {$sort:{timestamp:-1}},
    {$limit:1}
  ]
  return this.aggregate(pipeline).exec(callback);
};


RevisionSchema.statics.updateDB = function(title_search,lastTime,callback){
  var wikiEndpoint ="https://en.wikipedia.org/w/api.php";
  var parameters = [
    "titles="+title_search,
    "rvstart="+lastTime.toISOString(),
    "rvdir=newer", 
    "action=query",
    "format=json",
    "prop=revisions",
    "rvlimit=max",
    "rvprop=ids|flags|user|userid|timestamp|size|sha1|parsedcomment",
    "formatversion=2"
  ];

  var url = wikiEndpoint + "?" + parameters.join("&");

  console.log("url: " + url)
  var options = {
      url: url,
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
      }
  };

  request(options, function (err, res, data){
    if (err) {
        console.log('Error:', err);
    } else if (res.statusCode !== 200) {
        console.log('Error status code:', res.statusCode);
    } else {
        console.log('Status:', res.statusCode);
        var json = JSON.parse(data);
        var pages = json.query.pages;
        var revisions = pages[Object.keys(pages)[0]].revisions; 
        
        var newRevCount = 0
        for (revid in revisions){
          if(revisions[revid].timestamp.substring(0,19) == lastTime.toISOString().substring(0,19)){
            continue
          }
          if(revisions[revid].anon == true){
            var newRev = new Revision(
              {'user':revisions[revid].user,
              'anon':true,
              'userid':revisions[revid].userid,
              'timestamp':new Date(revisions[revid].timestamp),
              'size':revisions[revid].size,
              'sha1':revisions[revid].sha1,
              'parsedcomment':revisions[revid].parsedcomment,
              'title':title_search,
              }
            )
          }else{
            var newRev = new Revision(
              {'user':revisions[revid].user,
              'userid':revisions[revid].userid,
              'timestamp':new Date(revisions[revid].timestamp),
              'size':revisions[revid].size,
              'sha1':revisions[revid].sha1,
              'parsedcomment':revisions[revid].parsedcomment,
              'title':title_search,
              }
            )
          }
          newRevCount += 1
          newRev.save()
        }

        callback(null,newRevCount);

    }
  });

}


RevisionSchema.statics.redditPull = function(title_search,callback){
  var redditEndpoint ="https://www.reddit.com/r/" + title_search + "/top.json";
  var parameters = [
    "t=all",
    "limit=3"
  ];

  var url = encodeURI(redditEndpoint).replace(/%20/g,"+") + "?" + parameters.join("&");

  console.log("url: " + url)
  var options = {
      url: url,
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
      }
  };

  request(options, function (err, res, data){
    if (err) {
        console.log('Error:', err);
    } else if (res.statusCode !== 200) {
        console.log('Error status code:', res.statusCode);
    } else {
        console.log('Status:', res.statusCode);
        var json = JSON.parse(data);
        var posts = json.data.children;
        var postResults = []
        for (var i = 0; i < posts.length; i++){
          postResults[i] = {
            topic:posts[i].data.title,
            link:"https://www.reddit.com" + posts[i].data.permalink
          }
        }
        callback(null, postResults);
    }
  });

}

//Author analytics
RevisionSchema.statics.artRevByUser = function(user_search,callback){
  var pipeline = [
    {$match:{user:user_search}},
    {$group:{_id:"$title",count:{$sum:1}}},
    {$sort:{count:1}}
  ]
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.revTimeByUser = function(title_search,user_search,callback){
  var pipeline = [
    {$match:{$and:[{title:title_search},{user:user_search}]}},
    {$project:{timestamp:1}},
    {$sort:{timestamp:1}}
  ]
  return this.aggregate(pipeline).exec(callback);
};

RevisionSchema.statics.autoComplete = function(author_search,callback){
  var pipeline = [
    {$match:{user: new RegExp('^' + author_search,'i')}},
    {$group:{_id:"$user"}},
    {$sort:{_id:-1}},
    {$limit:5}
  ]
  return this.aggregate(pipeline).exec(callback);
};


function readType(path, type){
  var users = []
  var fileStream = fs.createReadStream(path);
  var rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  rl.on('line', function(line){
    users.push(line);
  })
  .on('close', function(){
    rl.close()
    Revision.updateMany(
      {$and:[{user:{$in:users}}, {usertype:{$ne: 'bot'}}]},
      {$set:{usertype: type}}
    ).exec(function(err){
      if (err){
        console.log(err)
      }
    });
  })
}


RevisionSchema.statics.updateUserType = function(callback){
  // readType('./Dataset_22_March_2020/administrators.txt', 'admin');
  // readType('./Dataset_22_March_2020/bots.txt', 'bot');
  readType('./demo_datasets/administrators.txt', 'admin');
  readType('./demo_datasets/bots.txt', 'bot');
  
  Revision.updateMany(
    {anon:{$exists:true}},
    {$set:{usertype: 'anon'}}
  ).exec(function(err){
    if (err){
      console.log(err)
    }
  });
    
  Revision.updateMany(
    {$and:[{usertype:{$exists:false}}, {anon:{$exists:false}}]},
    {$set:{usertype: 'regular'}}
  ).exec(function(err){
    if (err){
      console.log(err)
    }
  });
  callback(null)
};

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions')




// User Info
var UserInfoSchema = new mongoose.Schema(
    {
        firstname:{
            type:String,
            required:true,
            trim:true
        },
        lastname:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
        },
        password:{
            type:String,
            required:true,
            trim:true
        },
        resetQuestion:{
            type:String,
            required:true,
            trim:true
        },
        resetAnswer:{
            type:String,
            required:true,
            trim:true
        },
        createdTime:{
            type:Date,
            required:true,
            default:new Date()
        }
    }
)
// signup user
UserInfoSchema.statics.signup = function(userinfo,callback){
    bcrypt.hash(userinfo.password, saltRounds, function(err, hash){
        if(err){
            console.log(err)
        }else{
            var user = new UserInfo(
                {'firstname':userinfo.firstname,
                    'lastname':userinfo.lastname,
                    'email':userinfo.email,
                    'password':hash,
                    'resetQuestion':userinfo.resetQuestion,
                    'resetAnswer':userinfo.resetAnswer
                }
            )
            user.save(function(err, r){
                if(err){
                    console.log(err)
                    callback(null,-1)
                }else{
                    callback(null,1)
                }
            })
        }
    })
};

UserInfoSchema.statics.findUser = function(email,callback){
    return this.find({email:email}).exec(callback)
};


// login
UserInfoSchema.statics.login = function(loginInfo,callback){
    pswd = loginInfo.password
    UserInfo.find({'email':loginInfo.email})
        .exec(function(err,result){
            if (err){
                console.log("Query error!")
            }else{
                bcrypt.compare(pswd, result[0].password, function(err, result){
                    if(err){
                        console.log(err)
                    }else{
                        callback(null,result)
                    }
                })
            }
        });
};

UserInfoSchema.statics.resetPswd = function(resetInfo,callback){
    bcrypt.hash(resetInfo.password, saltRounds, function(err, hash){
        if(err){
            console.log(err)
        }else{
            UserInfo.update({'email':resetInfo.email},{$set:{password:hash}})
                .exec(function(err,result){
                    if (err){
                        console.log(err)
                    }else{
                        callback(null,1)
                    }
                });
        }
    })
};

var UserInfo = mongoose.model('UserInfo', UserInfoSchema, 'userinfos')
module.exports = {Revision,UserInfo}

