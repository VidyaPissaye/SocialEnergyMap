/**
 * Created with JetBrains RubyMine.
 * User: Vidya
 * Date: 1/7/13
 * Time: 4:30 PM
 * To change this template use File | Settings | File Templates.
 */

// Retrieves all the albums of the logged in user
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

// Retrieves the photos of the selected album
function getphotos(album_id, album_name) {

    FB.api(album_id + "/photos?limit=400&offset=0",function(photos){

        if (photos && photos.data && photos.data.length){

            var photo_frame = document.createElement('div');
            photo_frame.setAttribute("id", "image_frame");
            photo_frame.setAttribute("class", "cf");

            document.body.appendChild(photo_frame);

            var page_title = document.createElement('div');
            page_title.setAttribute("class", "page_title");

            var pic_name;

            if(album_name == "undefined") {
                pic_name = "Untitled";
            }
            else {
                pic_name = album_name;
            }

            var title = document.createTextNode("Album: "+pic_name);
            var div_albums = document.createElement('br');

            page_title.appendChild(title);
            photo_frame.appendChild(page_title);
            photo_frame.appendChild(div_albums);

            for (var j = 0; j < photos.data.length; j++){

                var photo = document.createElement('a');
                photo.id = photos.data[j].id;
                photo.name = photos.data[j].name;
                photo.from = photos.data[j].from.id;
                photo.source = photos.data[j].images[4].source;

                photo.setAttribute("href", "/home/user_likes?photo_id="+photo.id+"&photo_name="+photo.name+"&photo_from="+photo.from+"&photo_source="+photo.source);

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

function getuserlikes(photo_id, photo_name, photo_from, photo_source) {

    $("#statistics").hide();
    $("#likecommentlist").hide();

    var photo_frame = document.createElement('div');
    photo_frame.setAttribute("id", "image_frame");
    photo_frame.setAttribute("class", "cf");

    document.body.appendChild(photo_frame);

    var pic_name;

    if(photo_name == "undefined") {
        pic_name = "Untitled";
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
    image.style.float = "left";
    var pic = document.createElement('img');

    //    pic.src = photo[4].src;       // Photo Size = "width": 358,  "height": 480

    pic.src = photo_source;

    var span = document.createElement('span');
    span.style.float = "left";
    span.appendChild(pic);

    image.appendChild(span);

    // Get the 'Likes' on the photo
    FB.api(photo_id + "/likes", function(likes) {

        var heading = document.createElement('div');

        // Get the "Comments" on the photo
        FB.api({

                method: 'fql.multiquery',
                queries: {
                    query1: 'SELECT fromid, text FROM comment WHERE object_id="'+photo_id+'"',
                    query2: 'SELECT name, pic_square, uid FROM user WHERE uid IN (SELECT fromid FROM #query1)'
                }

            },
            function(comments) {

                var emotion_hash;

                // Process the comments information and populate the comments hash
                if(comments[0].fql_result_set.length != 0) {
                    emotion_hash = process_comments(comments);

                }

                // Populate "like" hash
                if(likes.data.length != 0) {

                    $("#statistics").show();
                    $("#likecommentlist").show();

                    $('#statistics > ul').tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
                    $('#statistics > ul').tabs({ selected: 1 });

                    $('#likecommentlist > ul').tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
                    $('#likecommentlist > ul').tabs({ selected: 1 });


                    var chart_div = document.createElement('div');
                    chart_div.setAttribute("id", "pie");

                    photo_frame.appendChild(chart_div);

                    var text = document.createTextNode("This picture has been liked by " + likes.data.length + " friend(s):");
                    heading.appendChild(text);
                  //  image.appendChild(heading);

                    process_likes(likes, photo_from, emotion_hash);
                   // image.appendChild(document.getElementById("likecommentlist"));

                }
                else {

                    var text = document.createTextNode("Sorry! This picture has not been liked by anyone :(");
                    heading.appendChild(text);
                    image.appendChild(heading);

                }
            });

        photo_frame.appendChild(image);
        photo_frame.appendChild(document.getElementById("statistics"));
        photo_frame.appendChild(heading);
        photo_frame.appendChild(document.getElementById("likecommentlist"))

    });
}

// Categorizes the comments using Google's prediction api
function process_comments(comments) {

    var comment_div = document.getElementById("Comments");
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    comment_div.appendChild(tbl);
    tbl.appendChild(tblBody);

    var emotion_hash = {}

    $.getJSON("/home/prediction_check_status", function (data) {

        if (data && data.response.trainingStatus == 'DONE') {

            // Get the comment text
            for(var j = 0; j < comments[0].fql_result_set.length; j++) {
                var name;
                var profile_pic = document.createElement('img');

                for(var k = 0; k < comments[1].fql_result_set.length; k++) {
                    if(comments[0].fql_result_set[j].fromid == comments[1].fql_result_set[k].uid) {
                        name = document.createTextNode("  "+comments[1].fql_result_set[k].name+": ");
                        profile_pic.src = comments[1].fql_result_set[k].pic_square;
                    }
                }

                var name_span = document.createElement('span');
                name_span.style.fontWeight = "bold";
                name_span.appendChild(name);
                var comment = document.createTextNode("  "+comments[0].fql_result_set[j].text);

                var user = document.createElement("tr");
                var pic_td = document.createElement("td");
                var name_td = document.createElement("td");
                var comment_td = document.createElement("td");
                pic_td.appendChild(profile_pic);
                name_td.appendChild(name_span);
                comment_td.appendChild(comment);
                user.appendChild(pic_td);
                user.appendChild(name_td);
                user.appendChild(comment_td);
                tblBody.appendChild(user);

                // Get the statistics of the comments on the picture
                $.ajax({
                    type: "POST",
                    url: "/home/predict",
                    data: {"input": comments[0].fql_result_set[j].text},
                    success: function(data) {
                        if (data && data.status == 'success') {

                            if(emotion_hash[data.response.outputLabel]) {
                                emotion_hash[data.response.outputLabel] = emotion_hash[data.response.outputLabel] + 1;
                            }
                            else {
                                emotion_hash[data.response.outputLabel] = 1;
                            }

                        }
                        else if (data && data.message) {
                            console.log(data.message);
                        }
                    }
                });
            }

        }
    });

    return emotion_hash
}

// Determines the hometown, gender and friends' list of the users in the likes record
function process_likes(likes, photo_from, emotion_hash) {


    var like_div = document.getElementById("Likes");

    // Get the Family and Friend list of the logged in user
    FB.api({
            //  access_token: authresponse.accessToken,
            method: 'fql.multiquery',
            queries: {
                query1: 'SELECT uid FROM family WHERE profile_id="'+photo_from+'"',
                query2: 'SELECT uid2 FROM friend WHERE uid1="'+photo_from+'"'
            }
        },
        function(relationship) {

            var arr_length = 0;
            var country_hash = {};
            var gender_hash = {};
            var friends_hash = {};

            var tbl = document.createElement("table");
            var tblBody = document.createElement("tbody");
            like_div.appendChild(tbl);
            tbl.appendChild(tblBody);

            for(var i = 0, l=likes.data.length; i<l; i++) {

                // Get demographic information of each user who liked the photo
                FB.api({
                        method: 'fql.query',
                        query: 'SELECT pic_square, name, sex, current_location, hometown_location, uid FROM user WHERE uid="'+likes.data[i].id+'"'

                    },
                    function(response) {

                        var profile_pic = document.createElement('img');
                        profile_pic.src = response[0].pic_square;
                        profile_pic.id = response[0].id;

                        var name = document.createTextNode("  "+response[0].name);
                        var user = document.createElement("tr");
                        var pic_td = document.createElement("td");
                        var name_td = document.createElement("td");
                        pic_td.appendChild(profile_pic);
                        name_td.appendChild(name);
                        user.appendChild(pic_td);
                        user.appendChild(name_td);
                        tblBody.appendChild(user);

                        if(response[0].sex) {
                            if(gender_hash[response[0].sex]) {
                                gender_hash[response[0].sex] = gender_hash[response[0].sex] + 1;
                            }
                            else {
                                gender_hash[response[0].sex] = 1;
                            }
                        }

                        if(response[0].hometown_location) {
                            if(country_hash[response[0].hometown_location.country]){
                                country_hash[response[0].hometown_location.country] = country_hash[response[0].hometown_location.country] + 1;
                            }
                            else{
                                country_hash[response[0].hometown_location.country] = 1;
                            }
                            arr_length++;
                        }
                        else {
                            if(country_hash['Unknown'])
                            {
                                country_hash['Unknown'] = country_hash['Unknown'] + 1;
                            }
                            else {
                                country_hash['Unknown'] = 1;
                            }
                            arr_length++;
                        }

                        var j = 0, k = 0;

                        while ((j < relationship[0].fql_result_set.length) &&
                            (relationship[0].fql_result_set[j].uid != response[0].uid)) {
                            j++;
                        }

                        if(j == relationship[0].fql_result_set.length) {
                            while ((k < relationship[1].fql_result_set.length) &&
                                (relationship[1].fql_result_set[k].uid2 != response[0].uid)) {
                                k++;
                            }
                        }

                        if(j != relationship[0].fql_result_set.length) {
                            if(friends_hash['Family']) {
                                friends_hash['Family'] = friends_hash['Family'] + 1;
                            }
                            else {
                                friends_hash['Family'] = 1;
                            }
                        }
                        else if(k != relationship[1].fql_result_set.length) {
                            if(friends_hash['Friends']) {
                                friends_hash['Friends'] = friends_hash['Friends'] + 1;
                            }
                            else {
                                friends_hash['Friends'] = 1;
                            }
                        }
                        else {
                            if(friends_hash['Others']) {
                                friends_hash['Others'] = friends_hash['Others'] + 1;
                            }
                            else {
                                friends_hash['Others'] = 1;
                            }
                        }

                        // Display the likes/comments of the picture and the calculated statistics based on user click
                        if (arr_length == likes.data.length)
                        {
                            display_statistic(country_hash, gender_hash, friends_hash, emotion_hash);
                        }

                        display_like_or_comment();

                    });
            }
        });
}


// Determine if "Like" info or "Comments" is selected and display
function display_like_or_comment() {

    var like_comment_tabs = document.getElementById("likecommentlist");

    // Default selection
    var like_div = document.getElementById("Likes");
    $("#likecommentlist").tabs();
    like_comment_tabs.appendChild(like_div);

    $("#likecommentlist a[href=#Likes]").click(function()
    {
        var Liketab = document.getElementById("Likes");
        like_comment_tabs.appendChild(Liketab);
    });

    $("#likecommentlist a[href=#Comments]").click(function()
    {
        var Commenttab = document.getElementById("Comments");
        like_comment_tabs.appendChild(Commenttab);
    });
}

// Determine user click on the statistic and display chart
function display_statistic(country_hash, gender_hash, friends_hash, emotion_hash) {

    var statistic_tabs = document.getElementById("statistics");

    var pie_chart = document.getElementById("pie");

    $("#statistics").tabs();

    // Default selection
    var Hometowntab = document.getElementById("HomeTown");
    Hometowntab.appendChild(pie_chart);
    statistic_tabs.appendChild(Hometowntab);
    drawChart(country_hash, "Where are your friends from?");

    $("#statistics a[href=#HomeTown]").click(function()
    {
        var Hometowntab = document.getElementById("HomeTown");
        Hometowntab.appendChild(pie_chart);
        statistic_tabs.appendChild(Hometowntab);
        drawChart(country_hash, "Where are your friends from?");
    });

    $("#statistics a[href=#Gender]").click(function()
    {
        var Gendertab = document.getElementById("Gender");
        Gendertab.appendChild(pie_chart);
        statistic_tabs.appendChild(Gendertab);
        drawChart(gender_hash, "what is the sex ratio of your friends?");
    });

    $("#statistics a[href=#Relationship]").click(function()
    {
        var Relationshiptab = document.getElementById("Relationship");
        Relationshiptab.appendChild(pie_chart);
        statistic_tabs.appendChild(Relationshiptab);
        drawChart(friends_hash, "How are they related to you?");
    });

    $("#statistics a[href=#Emotion]").click(function()
    {
        var Emotiontab = document.getElementById("Emotion");
        Emotiontab.appendChild(pie_chart);
        statistic_tabs.appendChild(Emotiontab);
        drawChart(emotion_hash, "How is their reaction to your picture?");
    });
}

// Creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(count, title_string) {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Statistic');
    data.addColumn('number', 'Count');

    for(key in count)
    {
        data.addRow([key, count[key]]);
    }

    // Set chart options
    var options = {'title':title_string,
        'width':340,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById("pie"));
    chart.draw(data, options);

}


