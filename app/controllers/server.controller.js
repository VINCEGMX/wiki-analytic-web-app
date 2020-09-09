var model = require("../models/revision")

module.exports.showMainPage=function(req,res){
    res.render("main.pug");
    model.Revision.updateUserType(function(err,result){
        if(err){
            console.log(err)
        }else{
            console.log('Usertype updated')
        }
    })
}

module.exports.showAnalyticPage=function(req,res){
    if(req.session){
        if(req.session.login){
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render("analytic.pug");
        }else{
            res.status(401).send('Unauthorized: need to login' )
        }
    }
}

//The top n ariticles with the highest/lowest number of revisions
//and their numver of revisions
module.exports.getExNumArticle=function(req,res){
    model.Revision.showExNumArticle(req.query, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}


//The top n articles edited by the largest/smallest group of registered users
//and their group size
module.exports.getExRegArticle=function(req,res){
    model.Revision.showExRegArticle(req.query, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}


//The top n articles with the longest/shortest history and their age
module.exports.getExHisArticle=function(req,res){
    model.Revision.showExHisArticle(req.query, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//for bar/line chart of revision number distribution by year and by user type
module.exports.getRevsByUsertypeByYear=function(req,res){
    model.Revision.revsByUsertypeByYear(function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}


//for pie chart of revision number distribution by user type 
module.exports.getRevDisByUsertype=function(req,res){
    model.Revision.revDisByUsertype(function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}


//The total number of revisions by all titles
module.exports.getTotalRevAllTitle=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    model.Revision.totalRevAllTitle(fromYear,toYear, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//The total number of revisions by one title
module.exports.getTotalRevTitle=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    title= req.query.title
    model.Revision.totalRevTitle(title,fromYear,toYear, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//The top 5 regular users ranked by total revision numbers for this title
module.exports.getTopRegularUsers=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    title = req.query.title
    model.Revision.topRegularUsers(fromYear,toYear,title, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//for bar chart of revision number distributed by year and by user type for this title
module.exports.getRevDisByYearByUsertypeArticle=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    title = req.query.title
    model.Revision.revDisByYearByUsertypeArticle(fromYear,toYear,title, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//for pie chart of revision number distribution based on user type for this title
module.exports.getRevDisByUsertypeArticle=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    title = req.query.title
    model.Revision.revDisByUsertypeArticle(fromYear,toYear,title, function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//for bar chart of revision number distributed by year
//by one of the top 5 regular users for this title
module.exports.getRevDisByYearTopRegUser=function(req,res){
    fromYear= req.query.fromYear
    toYear= req.query.toYear
    title = req.query.title
    topUser = req.query.user
    model.Revision.revDisByYearTopRegUser(fromYear,toYear,title,topUser,function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}


//get the timestamp of the lastest revision for this title
module.exports.getLastTimeTitle=function(req,res){
    model.Revision.lastTimeTitle(req.query.title,function(err,result){
        if(err){
            console.log(err)
        }else{
            console.log(result)
            res.json(result)
        }
    })
}


//check database is up to date
module.exports.updateDB=function(req,res){
    
    title = req.query.title
    
    model.Revision.lastTimeTitle(title,function(err,result){
        if(err){
            console.log(err)
        }else{
            var currentTime = new Date()
            var lastTime = new Date(result[0].timestamp)
            var timeDiff = Math.floor((currentTime - lastTime)/86400000)
            if(timeDiff>1){
                model.Revision.updateDB(title,lastTime,function(err,t_result){
                    if(err){
                        console.log(err)
                    }else{
                        //numOfUpdate: 0 ~ no new revision after the last one, nothing downloaded
                        //numOfUpdate: >0 ~ the number of new revisions after the last one
                        res.send({numOfUpdate:t_result})
                        if(t_result>0){
                            setTimeout(function(){
                                model.Revision.updateUserType(function(err,result){
                                    if(err){
                                        console.log(err)
                                    }else{
                                        console.log('Usertype updated')
                                    }
                                })
                            }, 2000);
                        }
                    }
                })
            }else{
                //less than one day, nothing downloaded
                res.send({numOfUpdate:-1})
            }
        }
    })
    
}

//update user type constantly
module.exports.updateUserType=function(req,res){
    model.Revision.updateUserType(function(err,result){
        if(err){
            console.log(err)
        }else{
            console.log('Usertype updated')
        }
    })
}


//pull top 3 posts from reddit given title
module.exports.redditPull=function(req,res){
    title = req.query.title
    model.Revision.redditPull(title, function(err,result){
        if(err){
            console.log(err)
        }else{
            console.log('Reddit pulled')
            res.json(result)
        }
    })
}

//display the articles' names along with number of revisions made by the user
module.exports.getArtRevByUser=function(req,res){
    model.Revision.artRevByUser(req.query.user,function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//display timestamps of all revisions made to the selected article
module.exports.getRevTimeByUser=function(req,res){
    model.Revision.revTimeByUser(req.query.title,req.query.user,function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}

//find the user name by the input substring
module.exports.getAutoComplete=function(req,res){
    model.Revision.autoComplete(req.query.text_search,function(err,result){
        if(err){
            console.log(err)
        }else{
            res.json(result)
        }
    })
}



//sign up function -> Create new user with given infos.
module.exports.signup=function(req,res){

    model.UserInfo.findUser(req.body.email, function(err,result){
        if(err){
            console.log(err)
            res.send({register:-1})
        }else{
            if(result.length == 0){
                model.UserInfo.signup(req.body, function(err,result){
                    if(err){
                        console.log(err)
                        res.send({register:-1})
                    }else{
                        res.send({register:1})
                    }
                })
            }else{
                res.send({register:0})
            }
        }
    })

}


// if user exist and password match, then it would be login sucessful.
module.exports.login=function(req,res){

    model.UserInfo.findUser(req.body.email, function(err,result){
        if(err){
            console.log(err)
            res.send({login:-1})
        }else{
            if(result.length == 0){
                res.send({login:0})
            }else{
                model.UserInfo.login(req.body, function(err,result){
                    if(err){
                        console.log(err)
                        res.send({login:-1})
                    }else{
                        // result: true: correct email password match
                        // result: false: incorrect
                        if(result){
                            req.session.login = true
                            res.send({login:2})
                        }else{
                            res.send({login:1})
                        }
                    }
                })
            }
        }
    })

}


//if user exist and answer is correct, reset password
module.exports.resetPassword=function(req,res){

    model.UserInfo.findUser(req.body.email, function(err,result){
        if(err){
            console.log(err)
            res.send({reset:-1})
        }else{
            if(result.length == 0){
                res.send({reset:0})
            }else if(result[0].resetQuestion == req.body.resetQuestion && result[0].resetAnswer ==req.body.resetAnswer){
                model.UserInfo.resetPswd(req.body, function(err,result){
                    if(err){
                        console.log(err)
                        res.send({reset:-1})
                    }else{
                        res.send({reset:2})
                    }
                })
            }else{
                res.send({reset:1})
            }
        }
    })
}

module.exports.logout= function(req,res){
    res.clearCookie('login');
    req.session.destroy()
    res.send({logout:true})
}