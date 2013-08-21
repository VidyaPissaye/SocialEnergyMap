require 'google/api_client'
require 'singleton'

class EmotionPrediction
  include Singleton

  # Project credentials
  # ------------------------
  DATA_OBJECT = "vidbucket/comments.txt" # This is the {bucket}/{object} name you are using for the language file.
  CLIENT_EMAIL = "248144510891@developer.gserviceaccount.com" # Email of service account
  KEYFILE = File.join( Rails.root, "config", "google_api_key.p12")  # key file generated from google account.
  PASSPHRASE = 'notasecret' # Passphrase for private key
  # ------------------------

  attr_reader :prediction, :client

  def self.instance
    @@instance ||= new
  end

  def initialize
    @prediction ||= configure
    train unless check_status["response"]["trainingStatus"] == "DONE"
  end

  def check_status
    result = @client.execute(
        :api_method => @prediction.trainedmodels.get,
        :parameters => {'id' => 'emotion_prediction_id'}
    )

    assemble_json_body(result)
  end

  # Runs the prediction api for the input string
  def predict(comment)
    input = @prediction.trainedmodels.predict.request_schema.new
    input.input = {}
    input.input.csv_instance = comment

    puts comment
    result = @client.execute(
        :api_method => @prediction.trainedmodels.predict,
        :parameters => {'id' => 'emotion_prediction_id'},
        :headers => {'Content-Type' => 'application/json'},
        :body_object => input
    )

    assemble_json_body(result)
  end

  def assemble_json_body(result)
    # Assemble some JSON our client-side code can work with.
    json = {}
    if result.status != 200
      if result.data["error"]
        message = result.data["error"]["errors"].first["message"]
        json["message"] = "#{message} [#{result.status}]"
      else
        json["message"] = "Error. [#{result.status}]"
      end
      json["response"] = ::JSON.parse(result.body)
      json["status"] = "error"
    else
      json["response"] = ::JSON.parse(result.body)
      json["status"] = "success"
    end
    return json
  end

  private

  # Configures the account for api use
  def configure
    @client = Google::APIClient.new

    #We must tell ruby to read the keyfile in binary mode.
    content = File.read(KEYFILE, :mode => 'rb')

    pkcs12 = OpenSSL::PKCS12.new(content, PASSPHRASE)
    key = pkcs12.key

    # Authorize service account
    #key = Google::APIClient::PKCS12.load_key(KEYFILE, PASSPHRASE)
    asserter = Google::APIClient::JWTAsserter.new(
        CLIENT_EMAIL,
        'https://www.googleapis.com/auth/prediction',
        key)
    @client.authorization = asserter.authorize()

    @prediction = @client.discovered_api('prediction', 'v1.5')

  end

  # Trains the dataset uploaded in the google account
  def train
    training = @prediction.trainedmodels.insert.request_schema.new
    training.id = 'emotion_prediction_id'
    training.storage_data_location = DATA_OBJECT
    result = @client.execute(
        :api_method => @prediction.trainedmodels.insert,
        :headers => {'Content-Type' => 'application/json'},
        :body_object => training
    )

    assemble_json_body(result)
  end
end