class HomeController < ApplicationController

  require 'json'
  require 'open-uri'

  def index



  end

  def user_albums
    @my_album = params[:my_album]
  end

  def album_photos

  #  @album = Album.new
  #  @album.album_id = params["album_id"]
  #  @album.name = params["album_name"]
  #  @album.save

   @album_name = params[:album_name]
   @album_id = params[:album_id]
  end


  def user_likes

    @photo_id = params[:photo_id]
    @photo_name = params[:photo_name]

  #  puts params.inspect
    #["access_token", "user_id"]

    #SELECT uid, name, pic_square FROM user WHERE uid = "user_id"
   # uri = URI.parse('https://graph.facebook.com/"user_id"?access_token="access_token"')
   # json = uri.open.read

  #  res = JSON.parse(json)


    # HTTPI curl library

    #res = HTTPI.GET "fb/graph?accessToken#{params["access_token"]}"

  end

  def new

  end

  def fb_parse_signed_request
    puts "hello awesome"

    puts params.inspect
    secret = "897002a0085e2a44dfdbc1ccbd247c19"
    res = {}

    respond_to do |format|
      format.json {
        render :json => {:result => parse_signed_request(params["signed_req"], secret)}
      }
    end

  end

  private
  def parse_signed_request(signed_request, secret, max_age=3600)
    puts "in parse_signed_request"
    puts signed_request
    encoded_sig, encoded_envelope = signed_request.split('.', 2)
    envelope = JSON.parse(base64_url_decode(encoded_envelope))
    algorithm = envelope['algorithm']

    raise 'Invalid request. (Unsupported algorithm.)' if algorithm != 'HMAC-SHA256'

    raise 'Invalid request. (Too old.)' if envelope['issued_at'] < Time.now.to_i - max_age

    raise 'Invalid request. (Invalid signature.)' if base64_url_decode(encoded_sig) != OpenSSL::HMAC.hexdigest('sha256', secret, encoded_envelope).split.pack('H*')

    envelope
  end

  def base64_url_decode(str)
    str += '=' * (4 - str.length.modulo(4))
    Base64.decode64(str.tr('-_', '+/'))
  end

end
