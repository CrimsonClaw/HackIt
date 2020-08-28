$(document).ready(function() {
    $('#myForm').on('submit', function(e) {
        console.log($('#myForm').serializeArray());
        e.preventDefault();
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: '/student/compile',
            data: $('#myForm').serializeArray()
        }).done(function(data) {
            console.log(data);
            $.each(data, function(i, field){
                $("#main").append(field + " ");
            });
        })
    })
});