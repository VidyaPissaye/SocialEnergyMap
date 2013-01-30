/**
 * Created with JetBrains RubyMine.
 * User: Vidya
 * Date: 1/7/13
 * Time: 4:30 PM
 * To change this template use File | Settings | File Templates.
 */




/*$(document).ready(function(){

    console.log("reached");
    $('#user_albums').click(function() {
        getphotolikes(FPAPI.current_user_id);
        console.log("Cool");

    });

});         */

function getalbums (user_id, my_album) {

    FB.api({
            //  access_token: authresponse.accessToken,
            method: 'fql.multiquery',
            queries: {
                query1: 'SELECT aid,object_id, name,link,photo_count,cover_object_id FROM album WHERE owner="'+user_id+'"',
                query2: 'SELECT src FROM photo WHERE object_id  IN (SELECT cover_object_id FROM #query1)'
            }
        },
        function(response) {

            var cover_valid = 0;
            $("#image_frame").html("");
            var frame = document.createElement('div');
            frame.setAttribute("id", "image_frame");
            frame.setAttribute("class", "cf");


            //    $(response[0].fql_result_set).each(function(index,value){

            for (var i=0; i<response[0].fql_result_set.length; i++) {

                if(response[0].fql_result_set[i].cover_object_id != 0)
                {

                   // var cover_src = response[1].fql_result_set[cover_valid++].src;

                    var album_name = document.createTextNode(response[0].fql_result_set[i].name);

                    var album = document.createElement('a');
                    album.album_id = response[0].fql_result_set[i].object_id;
                    album.aid = response[0].fql_result_set[i].aid;
                    album.album_name = response[0].fql_result_set[i].name;
                    album.link = response[0].fql_result_set[i].link;
                    album.count = response[0].fql_result_set[i].photo_count;
                    album.setAttribute("href", "/home/album_photos?album_id="+album.album_id+"&album="+album.album_name);

                    var cover_photo = document.createElement('img');
                    cover_photo.src = response[1].fql_result_set[cover_valid++].src;

                    album.appendChild(cover_photo);

                    var title = document.createElement('div');
                    title.setAttribute("class", "title");
                    title.appendChild(album_name);

                    var image = document.createElement('div');
                    image.setAttribute("class", "image");
                    image.appendChild(album);
                    image.appendChild(title);

                    frame.appendChild(image);

                    document.body.appendChild(frame);

                }
            }

        });

   // }
}

function getphotos(album_id)
{




    FB.api(album_id + "/photos?limit=400&offset=0",function(photos){
        //var photos = response["data"];

        if (photos && photos.data && photos.data.length){

            var photo_frame = document.createElement('div');
            photo_frame.setAttribute("id", "image_frame");
            photo_frame.setAttribute("class", "cf");

            for (var j=0; j<photos.data.length; j++){

                var photo = document.createElement('a');
                photo.id = photos.data[j].id;
                photo.name = photos.data[j].name;
                photo.setAttribute("href", "/home/user_likes?photo_id="+photo.id+"&photo="+photo.name);

                var picture = document.createElement('img');
                picture.src = photos.data[j].picture;
                photo.appendChild(picture);


                var image = document.createElement('div');
                image.setAttribute("class", "image");
                image.appendChild(photo);

                var title = document.createElement('div');
                title.setAttribute("class", "title");

                if(photos.data[j].name) {
                    var photo_name = document.createTextNode(photos.data[j].name);
                    title.appendChild(photo_name);

                }
                else{
                    var photo_name = document.createTextNode("Untitled");
                    title.appendChild(photo_name);
                }

                image.appendChild(title);
                photo_frame.appendChild(image);

                document.body.appendChild(photo_frame);

            }
        }
    });


}

function getuserlikes(photo_id){



   FB.api({
            method: 'fql.query',
            query: 'SELECT src, width=358, height=480 FROM photo_src WHERE photo_id="'+photo_id+'"'
        },
        function(photo) {

            var photo_frame = document.createElement('div');
            photo_frame.setAttribute("id", "image_frame");
            photo_frame.setAttribute("class", "cf");

            var image = document.createElement('div');
            image.setAttribute('class', 'picture');
            var pic = document.createElement('img');
            pic.src = photo[4].src;       // Photo Size = "width": 358,  "height": 480
            image.appendChild(pic);

            FB.api(photo_id + "/likes", function(likes) {

                var heading = document.createElement('div');
                heading.setAttribute("class", "title");

//                var chart_div = document.createElement('div');



                if(likes.data.length != 0) {

                    var text = document.createTextNode("This picture has been liked by " + likes.data.length+" people:");
                    heading.appendChild(text);
                    image.appendChild(heading);

                    for(var i= 0, l=likes.data.length; i<l; i++) {

                        var profile = document.createElement('div');
                        profile.setAttribute("class", "profile");



                        FB.api({
                                method: 'fql.query',
                                query: 'SELECT pic_square, name, sex, current_location, hometown_location, uid FROM user WHERE uid="'+likes.data[i].id+'"'

                            },
                            function(response) {

                                console.debug(response[0]);

                                var profile_pic = document.createElement('img');
                                profile_pic.src = response[0].pic_square;
                                profile_pic.id = response[0].id;

                                var name = document.createTextNode(response[0].name);
                                profile_pic.appendChild(name);
                                profile.appendChild(profile_pic);
                                profile.appendChild(name);

                                var linebreak = document.createElement('br');
                                profile.appendChild(linebreak);


                            } );

                    }



                    //photo_frame.appendChild(chart_div);
                    image.appendChild(profile);
                }
                else {

                    var text = document.createTextNode("Sorry! This picture has not been liked by anyone :(");
                    heading.appendChild(text);
                    image.appendChild(heading);

                }


                photo_frame.appendChild(image);

                document.body.appendChild(photo_frame);

            });
        });

    console.debug("erhther");
    //$(document).bind("onGoogleReady", function(){


        var chart_div = document.createElement('div');
        chart_div.setAttribute("id", "pie");

    // Load the Visualization API and the piechart package.

      //  google.load('visualization', '1.0', {'packages':['corechart']});
        document.body.appendChild(chart_div);


        //google.load('visualization', '1', {'packages':['corechart']});
        //google.setOnLoadCallback(drawChart);


        // Set a callback to run when the Google Visualization API is loaded.



        drawChart();





//    }
//);

}

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

    console.log("drawChart");

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
        ['Mushrooms', 3],
        ['Onions', 1],
        ['Olives', 1],
        ['Zucchini', 1],
        ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {'title':'How Much Pizza I Ate Last Night',
        'width':400,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('pie'));
    console.debug(chart);
    chart.draw(data, options);
}

function getdata(data){

    $(data).each(function(index,value){
        // console.log(value.aid + ' - '+ value.cover+ ' - '+ value.title );
        $("#fb_albumb").append('<h3>'+ value.title +'</h3><a href="'+ value.link  +'" target="_blank" ><img src="'+ value.cover +'" title="'+ value.title +'" /></a><br/>');
    })
}

