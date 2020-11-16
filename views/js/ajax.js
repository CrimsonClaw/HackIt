$(document).ready(function() {
    $('#myForm').on('submit', function(e) {
        var formdata = $('#myForm').serializeArray();
        console.log(formdata);
        e.preventDefault();
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/student/compile',
            data: formdata
        }).done(function(data) {
            $("#main").html("Test Cases Passed: " + data.pass + " Of " + data.total);
        })
    })
});

$(document).ready(function() {
    $('#compile').on('click', function(e) {
        var formdata = $('#myForm').serializeArray();
        formdata[1].value = localStorage.getItem("code");
        console.log(formdata);
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/student/check',
            data: formdata
        }).done(function(data) {
            console.log(data);
            let obt = data.obt;
            console.log(obt);
            var dynamicHTML;
            for(var i=0; i<obt.length; i++){
                var id = "#out" + String(i);
                $(id).html(obt[i].output);
            }
        })
    })
})