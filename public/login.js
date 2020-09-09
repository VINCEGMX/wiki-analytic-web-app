$(function() {
    $(".txt input").on("focus",function(){
        $(this).addClass("focus");
    });

    $(".txt input").on("blur",function(){
        if($(this).val() =="")
            $(this).removeClass("focus");
    });

    $(".signbtn").on("click",function(){
        $("#registerRes").text("")
        if($(".signup").css("display")=="none"){
            $(".login").hide();
            $(".signup").show();
        }else{
            $(".login").show();
            $(".signup").hide();
        }
    });

    $(".resetbtn").on("click",function(){
        $("#resetRes").text("")
        $(".resetIn").show();
        $(".login").hide();
        $(".signup").hide();
    });

    $(".rbtn").on("click",function(){
        $(".resetIn").hide();
        $(".login").show();
        $(".signup").hide();
    });

    $(".backLogin").on("click",function(){
        $(":text,:password,input[name='email']").val('')
        $("#registerRes").text("")
        $("#resetRes").text("")
        $("#signinRes").text("")
    });

    $("#login").on("click",function(){
        $("#signinRes").text("")
        $(":text,:password,input[name='email']").val('')
        $(".resetIn").hide();
        $(".login").show();
        $(".signup").hide();
    })

    $("input[type='reset']").on('click',function(){
        $("#registerRes").text("")
        $("#resetRes").text("")
    })

    $("#signupForm").submit(function(event){
        event.preventDefault()
        var empty = false
        var confirm = true
        $(this).find('input[type!="hidden"]').each(function(){
            if(!$(this).val()){
                empty = true
            }
        })
        if($("#password").val() != $("#confirm_password").val()){
            confirm =false
        }
        if(empty){
            $("#registerRes").css("color", "red")
            $("#registerRes").text("Please fill all fields")
        }else if(!confirm){
            $("#registerRes").css("color", "red")
            $("#registerRes").text("Please confirm your password")
        }else{
            $.ajax({
                type: $(this).attr('method'),
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(res){
                    console.log(res)
                    if(res.register == -1){
                        $("#registerRes").css("color", "red")
                        $("#registerRes").text("Sign up failed. Please try again")
                    }else if(res.register == 0){
                        $("#registerRes").css("color", "red")
                        $("#registerRes").text("User alread exist")
                    }else{
                        $("#registerRes").css("color", "green")
                        $("#registerRes").text("Signup successfully")
                    }
                }
            })
        }
    })

    $("#loginForm").submit(function(event){
        event.preventDefault()
        var empty = false
        $(this).find('input[type!="hidden"]').each(function(){
            if(!$(this).val()){
                empty = true
            }
        })
        if(empty){
            $("#signinRes").css("color", "red")
            $("#signinRes").text("Please fill all fields")
        }else{
            $.ajax({
                type: $(this).attr('method'),
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(res){
                    console.log(res)
                    if(res.login == -1){
                        $("#signinRes").css("color", "red")
                        $("#signinRes").text("Login failed. Please try again")
                    }else if(res.login == 0){
                        $("#signinRes").css("color", "red")
                        $("#signinRes").text("User does not exist")
                    }else if(res.login ==1){
                        $("#signinRes").css("color", "red")
                        $("#signinRes").text("Password incorrect")
                    }else{
                        // $("#loginForm").unbind("submit").submit()
                        $("#signinRes").css("color", "green")
                        $("#signinRes").text("Login successfully")
                        window.location.href= "/analytic"
                    }
                }
            })
        }
    })

    $("#resetForm").submit(function(event){
        event.preventDefault()
        var empty = false
        $(this).find('input[type!="hidden"]').each(function(){
            if(!$(this).val()){
                empty = true
            }
        })
        if(empty){
            $("#resetRes").css("color", "red")
            $("#resetRes").text("Please fill all fields")
        }else{
            $.ajax({
                type: $(this).attr('method'),
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(res){
                    console.log(res)
                    if(res.reset == -1){
                        $("#resetRes").css("color", "red")
                        $("#resetRes").text("Password reset failed. Please try again")
                    }else if(res.reset == 0){
                        $("#resetRes").css("color", "red")
                        $("#resetRes").text("User does not exist")
                    }else if(res.reset == 1){
                        $("#resetRes").css("color", "red")
                        $("#resetRes").text("Question or answer incorrect")
                    }else{
                        $("#resetRes").css("color", "green")
                        $("#resetRes").text("Password reset successfully")
                    }
                }
            })
        }
    })

})