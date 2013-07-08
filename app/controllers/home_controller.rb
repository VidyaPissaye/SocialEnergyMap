require 'json'
require 'open-uri'

class HomeController < ApplicationController
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

  def predict

    emotion_prediction = EmotionPrediction.instance
    result = emotion_prediction.predict([params["input"]])

    respond_to do |format|
      format.json { render :json => result, :layout => false }
    end

  end

  def prediction_check_status
    emotion_prediction = EmotionPrediction.instance
    status = emotion_prediction.check_status

    respond_to do |format|
      format.json { render :json => status, :layout => false }
    end

  end

end
