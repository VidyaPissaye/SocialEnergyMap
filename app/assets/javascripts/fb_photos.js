/**
 * Created with JetBrains RubyMine.
 * User: Vidya
 * Date: 1/7/13
 * Time: 4:30 PM
 * To change this template use File | Settings | File Templates.
 */


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

            document.body.appendChild(frame);

            var page_title = document.createElement('div');
            page_title.setAttribute("class", "page_title");

            var title = document.createTextNode("Your Albums");
            var div_albums = document.createElement('br');

            page_title.appendChild(title);
            frame.appendChild(page_title);
            frame.appendChild(div_albums);

            for (var i=0; i<response[0].fql_result_set.length; i++) {

                if(response[0].fql_result_set[i].cover_object_id != 0)
                {


                    var album_name = document.createTextNode(response[0].fql_result_set[i].name);

                    var album = document.createElement('a');
                    album_id = response[0].fql_result_set[i].object_id;
                    album.aid = response[0].fql_result_set[i].aid;
                    album.album_name = response[0].fql_result_set[i].name;
                    album.link = response[0].fql_result_set[i].link;
                    album.count = response[0].fql_result_set[i].photo_count;

                    album.setAttribute("href", "/home/album_photos?album_id="+album_id+"&album_name="+album.album_name);

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

                }
            }

        });

}

function getphotos(album_id, album_name)
{

    FB.api(album_id + "/photos?limit=400&offset=0",function(photos){
        //var photos = response["data"];

        if (photos && photos.data && photos.data.length){

            var photo_frame = document.createElement('div');
            photo_frame.setAttribute("id", "image_frame");
            photo_frame.setAttribute("class", "cf");

            document.body.appendChild(photo_frame);

            var page_title = document.createElement('div');
            page_title.setAttribute("class", "page_title");

            var pic_name;

            if(album_name == "undefined") {
                pic_name = "Untitled"
            }
            else {
                pic_name = album_name;
            }

            var title = document.createTextNode("Album: "+pic_name);
            var div_albums = document.createElement('br');

            page_title.appendChild(title);
            photo_frame.appendChild(page_title);
            photo_frame.appendChild(div_albums);

            for (var j=0; j<photos.data.length; j++){
                var photo = document.createElement('a');
                photo.id = photos.data[j].id;
                photo.name = photos.data[j].name;
                photo.setAttribute("href", "/home/user_likes?photo_id="+photo.id+"&photo_name="+photo.name);

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


            }
        }
    });


}

function getuserlikes(photo_id, photo_name){



   FB.api({
            method: 'fql.query',
            query: 'SELECT src, width=358, height=480 FROM photo_src WHERE photo_id="'+photo_id+'"'
        },
        function(photo) {
            var photo_frame = document.createElement('div');
            photo_frame.setAttribute("id", "image_frame");
            photo_frame.setAttribute("class", "cf");

            document.body.appendChild(photo_frame);

            var pic_name;

            if(photo_name == "undefined") {
                pic_name = "Untitled"
            }
            else {
                pic_name = photo_name;
            }

            var page_title = document.createElement('div');
            page_title.setAttribute("class", "page_title");

            var title = document.createTextNode(pic_name);
            var linebreak = document.createElement('br');

            page_title.appendChild(title);
            photo_frame.appendChild(page_title);
            photo_frame.appendChild(linebreak);

            var image = document.createElement('div');
            image.setAttribute('class', 'picture');
            var pic = document.createElement('img');
            pic.src = photo[4].src;       // Photo Size = "width": 358,  "height": 480
            image.appendChild(pic);

            FB.api(photo_id + "/likes", function(likes) {

                var heading = document.createElement('div');
                //heading.setAttribute("class", "title");

                var chart_div = document.createElement('div');
                chart_div.setAttribute("id", "pie");

                photo_frame.appendChild(chart_div);


                if(likes.data.length != 0) {

                    var text = document.createTextNode("This picture has been liked by " + likes.data.length + " friend(s):");
                    heading.appendChild(text);
                    image.appendChild(heading);

                    var country_hash = {};
                    var arr_length = 0;


                    var profile = document.createElement('div');
                    profile.setAttribute("class", "profile");

                    for(var i= 0, l=likes.data.length; i<l; i++) {


                        FB.api({
                                method: 'fql.query',
                                query: 'SELECT pic_square, name, sex, current_location, hometown_location, uid FROM user WHERE uid="'+likes.data[i].id+'"'

                            },
                            function(response) {

                                var profile_pic = document.createElement('img');
                                profile_pic.src = response[0].pic_square;
                                profile_pic.id = response[0].id;

                                var name = document.createTextNode(response[0].name);
                                profile.appendChild(profile_pic);
                                profile.appendChild(name);

                                var linebreak = document.createElement('br');
                                profile.appendChild(linebreak);

                                if(response[0].hometown_location) {
                                    if(country_hash[response[0].hometown_location.country]){
                                        country_hash[response[0].hometown_location.country] = country_hash[response[0].hometown_location.country] + 1;
                                    }
                                    else{
                                        country_hash[response[0].hometown_location.country] = 1;
                                    }
                                    arr_length++;
                                }
                                else{
                                    if(country_hash['Unknown'])
                                    {
                                        country_hash['Unknown'] = country_hash['Unknown'] + 1;
                                    }
                                    else{
                                        country_hash['Unknown'] = 1;
                                    }
                                    arr_length++;
                                }

                                if (arr_length == likes.data.length)
                                {
                                    drawChart(country_hash);
                                }


                            } );

                    }

                    image.appendChild(profile);
                }
                else {

                    var text = document.createTextNode("Sorry! This picture has not been liked by anyone :(");
                    heading.appendChild(text);
                    image.appendChild(heading);

                }
                photo_frame.appendChild(image);
            });
        });

}

// Creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(country_count) {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Countries');
    data.addColumn('number', 'Count');

    for(key in country_count)
    {
        data.addRow([key, country_count[key]]);
    }

    // Set chart options
    var options = {'title':'Where are your friends from?',
        'width':400,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('pie'));
    chart.draw(data, options);
}


