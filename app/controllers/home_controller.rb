class HomeController < ApplicationController

  require 'json'
  require 'open-uri'

  def index



  end

  def user_albums
    @my_album = params[:my_album]
  end

  def album_photos

   @album_name = params[:album_name]
   @album_id = params[:album_id]
  end


  def user_likes

    @photo_id = params[:photo_id]
    @photo_name = params[:photo_name]
    @photo_from = params[:photo_from]
    @photo_source = params[:photo_source]

  end

  def new

  end


end
