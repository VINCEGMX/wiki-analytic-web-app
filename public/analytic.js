google.charts.load('current', {packages: ['corechart']});

$(function() {
    var chart_overall
    var chart_individual

    $(".entertxt").on("focus",function(){
        $(this).addClass("focus");
    });
    
    $(".entertxt").on("blur",function(){
        if($(this).val() =="")
        $(this).removeClass("focus");
    });
    $('#LogoutBtn').click(function(){
      $.ajax({
        type: 'get',
        url: '/logout',
        data: '',
        success: function(res){
          console.log(res)
          window.location.href= "/"
        }
      })
      // $.get('/logout', function(){
      //   console.log('logout')
      //   window.location.href= "/"
      // })
    })

  // *****************************
  // Overall
  // *****************************
    var Limit = 2;  //default

  // *****************************
  // articles revisions
  // *****************************
    function renderRevision(selector, options){
        //render highest/lowest revision
        $.get('analytic/getExNumArticle',options, data=>{
          $(selector).empty(); //empty current content
          $(selector).append(`
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th> Revisions</th>
                </tr>
              </thead>
            <tbody>
          `); //create table head
          for(let i=0;i<data.length;i++){
          $(selector+" tbody").append(`
            <tr>
              <td>${data[i]._id}</td>  <td>${data[i].count}</td>
            </tr>`);
          }
          $(selector).append(`
            </tbody>
          </table>
          `);
        });
      }

  // *****************************
  // registered users group
  // *****************************
      function renderUserGroup(selector, options){
        //render largest/smallest group of registered users
        $.get('analytic/getExRegArticle',options, data=>{
          $(selector).empty(); //empty current content
          $(selector).append(`
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Revisions</th>
                </tr>
              </thead>
            <tbody>
          `); //create table head
          for(let i=0;i<data.length;i++){
              $(selector+" tbody").append(`
                <tr>
                  <td>${data[i]._id}</td>  <td>${data[i].groupSize}</td>
                </tr>`);
          }
          $(selector).append(`
            </tbody>
          </table>
          `);
        });
      }

// *****************************
// history
// ***************************** 
    function renderHistory(selector, options){
        //render Top 3 longest/shortest group articles
        $.get('analytic/getExHisArticle',options, data=>{
          $(selector).empty(); //empty current content
          $(selector).append(`
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Have Created (days)</th>
                </tr>
              </thead>
            <tbody>
          `); //create table head
          for(let i=0;i<data.length;i++){
            $(selector+" tbody").append(`
              <tr>
                <td>${data[i]._id}</td>  <td>${data[i].age}</td>
              </tr>`);
          }
          $(selector).append(`
            </tbody>
          </table>
          `);
        });
      }

  // *****************************
  // Distribution Charts by Google chart
  // *****************************
    function getChartOptions(title,width){
      return{
        'legend': {position:'top',alignment:'center'},
        'fontSize': 15,
        'title':title,
        'chartArea':{width:'90%',height:'90%'},
        'titlePosition':'none',
        'width':width,
        'height':600,
        'bar':{groupWidth: "95%"}
      };
    }
  // *****************************
  // distribution by year and by user type
  // *****************************
    function loadDataCharts(data, myChart){
      var graphData = new google.visualization.DataTable();
      graphData.addColumn('string', 'Year');
      graphData.addColumn('number', 'Administrator');
      graphData.addColumn('number', 'Anonymous');
      graphData.addColumn('number', 'Bot');
      graphData.addColumn('number', 'Registered User');
      $.each(data, function(key, val) {
        graphData.addRow([String(val._id),val.numOfAdmin,val.numOfBot,val.numOfAnon,val.numOfRegular]);
      });
      var options = getChartOptions("Distribution of User Types by Year",1000);
      var chart = new google.visualization.ChartWrapper({
        containerId: myChart
      });
      chart.setDataTable(graphData)
      chart.setOptions(options)
      return chart
    }

    function drawBar(chart){
      chart.setChartType('ColumnChart')
      chart.draw()
    }

    function drawLine(chart){
      chart.setChartType('LineChart')
      chart.draw()
    }

  // *****************************
  // distribution by user type
  // *****************************
  function drawPie(data,selector){
    // Revision number distribution by year and by user
    var graphData = new google.visualization.DataTable();
    graphData.addColumn('string', 'User');
    graphData.addColumn('number', 'Number');
    var dict = {}
    $.each(data, function(key, val) {
        graphData.addRow([val._id, val.count]);
        dict[val._id] = val.count
    });
    var sum = 0
    for(var el in dict){
      if(dict.hasOwnProperty(el)){
        sum += parseFloat(dict[el])
      }
    }
    for(var el in dict){
      if(dict.hasOwnProperty(el)){
        dict[el] = Math.round(dict[el]*100/sum)
      }
    }
    $("#pieInfo").html("The graph shows the revision number distribution by user type, in which <strong>"+sum+"</strong> number of \
    users are taken into consideration for this analysis. From the pie chart, it is clear that the revisions were made mostly by \
    <strong>regular</strong> users that cover for <strong>"+dict['regular']+"</strong> percent, followed by <strong>anonymous</strong> \
    users with <strong>"+dict['anon']+"</strong> percent. The <strong>administrator</strong> users stands at \
    <strong>"+dict['admin']+"</strong> percent, which is larger than revisions made by <strong>bot</strong> \
    users (<strong>"+dict['bot']+"</strong> percent).")
    var options = getChartOptions("Distribution by User Type",700)
    var chart = new google.visualization.PieChart($(selector)[0]);
    chart.draw(graphData, options);
  }




  // *****************************
  // Individual Article Analytics
    // default value
    var fromYearValue = 2001;
    var toYearValue = 2020;

  // select list
    function renderTotalTitle(selector,options){
        $.get('analytic/getTotalRevAllTitle',options,data=>{
            $(selector).empty();
            for(var i=0;i<data.length;i++){
                $(selector).append(`<option value="${data[i]._id}"> ${data[i]._id}  (${data[i].count})</option>`);
            }
        });
    }

    renderTotalTitle('#titleList',{fromYear:fromYearValue,toYear:toYearValue});

  // *****************************
  // summary information

    function renderTable(selector, options){
        $.get('analytic/getTotalRevTitle',options, data=>{
            $(selector).empty(); //empty current content
            $(selector).append(`
        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Total Revision</th>
            </tr>
          </thead>
        <tbody>
      `); //create table head
            for(let i=0;i<data.length;i++){
                $(selector+" tbody").append(`
          <tr>
            <td>${data[i]._id}</td>  <td>${data[i].count}</td>
          </tr>`);
            }
            $(selector).append(`
        </tbody>
      </table>
      `);
        });
    }

    function renderUser(selector,options){
        $.get('analytic/getTopRegularUsers',options,data=>{
            $(selector).empty();
            $(selector).append(`
        <table class="table">
          <thead>
            <tr>
              <th>Top 5 regular users</th>
              <th>Their revisions</th>
            </tr>
          </thead>
        <tbody>
      `); //create table head
            for(let i=0;i<data.length;i++){
                $(selector+" tbody").append(`
          <tr>
            <td>${data[i]._id}</td>  <td>${data[i].count}</td>
          </tr>`);
            }
            $(selector).append(`
        </tbody>
      </table>
      `);
        });
    }

    function renderUsers(selector,options){
        $.get('analytic/getTopRegularUsers',options,data=>{
            $(selector).empty();
            for(var i=0;i<data.length;i++){
                $(selector).append(`<option value="${data[i]._id}"> ${data[i]._id}  (${data[i].count})</option>`);
            }
        });
    }

    function renderReddit(selector,options){
        $.get('analytic/redditPull',options,data=>{
            $(selector).empty();
            for(var i=0;i<data.length;i++){
                $(selector).append(`<li><a href="${data[i].link}" target="_blank">${data[i].topic}"<br />"${data[i].link}</a></li>`);
            }
        });
    }

    function updateDB(selector,options){
        $.get('analytic/updateDB',options,data=>{
            $(selector).empty();
            if(data.numOfUpdate == -1){
                $(selector).append(`*Nothing in database need to be updated`).css("color","blue");
            }else if (data.numOfUpdate == 0){
                $(selector).append(`*No new revision after the last one, nothing need to be downloaded`).css("color","green");
            }else{
                $(selector).append(`*There are ${data.numOfUpdate} new revisions have been downloaded`).css("color","red");
            }
        });
    }

    function drawBarIn(data, myChart, user){
        var graphData = new google.visualization.DataTable();
        graphData.addColumn('string', 'Year');
        graphData.addColumn('number', user);
        $.each(data, function(key, val) {
            graphData.addRow([String(val._id),val.count]);
        });
        var options = getChartOptions("Distribution of User Types by Year",1000);
        var chart = new google.visualization.ColumnChart($(myChart)[0]);
        chart.draw(graphData, options);
    }
  // *****************************
  // render individual
  // *****************************

    $("#articleSelectBtn").click(function(event){
        event.preventDefault();
        $("#fromYearInput,#toYearInput").val("")
        $("input[type='checkbox']").prop("checked",false)
        let articleName = $("#titleList")[0].value;
        updateDB("#updateMessage",{title:articleName});
        renderTable("#TitleTable",{title:articleName,fromYear:fromYearValue,toYear:toYearValue});
        renderUser("#UsersTable",{fromYear:fromYearValue,toYear:toYearValue,title:articleName});
        renderReddit("#redditList",{title:articleName});
        $(".chartDis").show();
        $.get('analytic/getRevDisByYearByUsertypeArticle', {fromYear:fromYearValue,toYear:toYearValue,title:articleName},data=>{
            chart_individual = loadDataCharts(data, "individualChart1")
            drawBar(chart_individual)
            $("#individualChart1").hide();
        });

        $.get('analytic/getRevDisByUsertypeArticle', {fromYear:fromYearValue,toYear:toYearValue,title:articleName},data=>{
          drawPie(data, "#individualChart2");
          $("#individualChart2").hide();
        });

        $("#inChart1").on("click",function(){
          if($(this).is(":checked")){
            $("#individualChart1").show();
          }else{
            $(this).prop("checked",false)
            $("#individualChart1").hide();
          }
        })

        $("#inChart2").on("click",function(){
          if($(this).is(":checked")){
            $("#individualChart2").show();
          }else{
            $(this).prop("checked",false)
            $("#individualChart2").hide();
          }
        })
        
        $("#inChart3").on("click",function(){
          if($(this).is(":checked")){
            $("#userList").show();
            $("#userSelectBtn").show();
            $("#userIns").show();
          }else{
            $(this).prop("checked",false)
            $("#individualChart3").empty();
            $("#userList").hide();
            $("#userSelectBtn").hide();
            $("#userIns").hide();
          }
        })
        
        renderUsers('#userList',{title:articleName,fromYear:fromYearValue,toYear:toYearValue});
        $(".left").show();
        $(".right").show();
        $("#yearInputBtn").show();
        $("#userSelectBtn").click(function(event){
            event.preventDefault();
            let userName = $("#userList")[0].value;
            $.get('analytic/getRevDisByYearTopRegUser', {fromYear:fromYearValue,toYear:toYearValue,title:articleName,user:userName},data=>{
                drawBarIn(data, "#individualChart3", userName);
            });
        });
        $("#yearInputBtn").on("click",function(){
            $("#yearRes").text("")
            if($("#fromYearInput").val()<$("#toYearInput").val()){
              var fromYearValue= $("#fromYearInput").val();
              var toYearValue= $("#toYearInput").val();

              $("#TitleTable").empty();
              $("#UsersTable").empty();
              $("#individualChart1").empty();
              $("#individualChart2").empty();
              $("#userList").empty();
              $("#individualChart3").empty(); 
              renderTable("#TitleTable",{title:articleName,fromYear:fromYearValue,toYear:toYearValue});
              renderUser("#UsersTable",{fromYear:fromYearValue,toYear:toYearValue,title:articleName});
              $(".chartDis").show();
              $.get('analytic/getRevDisByYearByUsertypeArticle', {fromYear:fromYearValue,toYear:toYearValue,title:articleName},data=>{
                  chart_individual = loadDataCharts(data, "individualChart1")
                  drawBar(chart_individual)
              });
              $.get('analytic/getRevDisByUsertypeArticle', {fromYear:fromYearValue,toYear:toYearValue,title:articleName},data=>{
                  drawPie(data, "#individualChart2");
              });
              renderUsers('#userList',{title:articleName,fromYear:fromYearValue,toYear:toYearValue});
              $("#userSelectBtn").click(function(event){
                event.preventDefault();
                let userName = $("#userList")[0].value;
                $.get('analytic/getRevDisByYearTopRegUser', {fromYear:fromYearValue,toYear:toYearValue,title:articleName,user:userName},data=>{
                    drawBarIn(data, "#individualChart3", userName);
                });
              });
            }else{
                alert("Invalid year input. Plaese enter again.")
            }
        });
    });

  // *****************************
  // author analytics
  // *****************************
    $("#timeArea").hide()
    $("#authorName").on("input",function(){
        var availableUsers = []
        $.get('analytic/getAutoComplete',{text_search: $("#authorName").val()},data=>{
            for(var i=0;i<data.length;i++){
                availableUsers.push(data[i]._id)
            }
            $("#authorName").autocomplete({
                autoFocus:true,
                source: availableUsers
            })
        });
    });

    $("#authorNameBtn").on("click", function(){
        $("#authorName").autocomplete("close")
        $.get('analytic/getArtRevByUser',{user: $("#authorName").val()},data=>{
          $("#articleSearch").empty()
            for(var i=0;i<data.length;i++){
              $("#articleSearch").append(`<option value="${data[i]._id}"> ${data[i]._id}  (${data[i].count}) </option>`);
            }
        });
    })

    $("#articleSearchBtn").click(function(){
      $("#timeArea").show()
      var timeList = []
        $.get('analytic/getRevTimeByUser',{title:$("#articleSearch").val(),user: $("#authorName").val()},data=>{
            for(var i=0;i<data.length;i++){
                timeList.push(new Date(data[i].timestamp))
            }
            var str = timeList.join('\n\n')
            $("#timeInfo").html("Timestamps of full revision history made by user <i>"+$("#authorName").val()+"</i> of article <i>"+$("#articleSearch").val()+"</i>")
            $("#timeArea").text(str)
            if(data.length<=5){
              $("#timeArea").attr('rows',data.length*2-1)
            }else{
              $("#timeArea").attr('rows',10)
            }
        });
    });

  // *****************************
  // render tables
  // *****************************
  $("#LimitBtn").click(function(){
    let Limit = parseInt($("#Limit").val());
    renderRevision("#highestRevision", {sort:-1,limit:Limit});
    renderRevision("#lowestRevision", {sort:1,limit:Limit});
    renderUserGroup("#largestGroupUser", {sort:-1,limit:Limit});
    renderUserGroup("#samllestGroupUser",  {sort:1,limit:Limit});
    renderHistory("#longestHistory", {sort:-1,limit:Limit});
    renderHistory("#shortestHistory", {sort:1,limit:Limit});
  });

  //highest
  renderRevision("#highestRevision", {sort:-1,limit:Limit});
    
  //lowest
  renderRevision("#lowestRevision", {sort:1,limit:Limit});

  //largest
  renderUserGroup("#largestGroupUser", {sort:-1,limit:Limit});

  //smallest
  renderUserGroup("#samllestGroupUser",  {sort:1,limit:Limit});

  //longest
  renderHistory("#longestHistory", {sort:-1,limit:Limit});

  //shortest
  renderHistory("#shortestHistory", {sort:1,limit:Limit});




  // *****************************
  // render distribution charts
  // *****************************

  $.get('analytic/getRevsByUsertypeByYear', data=>{
    // drawBar(data, "#Chart1", "bar");
    chart_overall = loadDataCharts(data, "Chart1")
    drawBar(chart_overall)
    flag = 1;
 });

  $("#TransBtn").click(function(event){
    event.preventDefault();
    if(flag==1){
      drawLine(chart_overall);
      flag=0;
    }else{
      drawBar(chart_overall);
      flag=1;
    }
  });

  $.get('analytic/getRevDisByUsertype', data=>{
    drawPie(data, "#Chart2");
  });

    
});
