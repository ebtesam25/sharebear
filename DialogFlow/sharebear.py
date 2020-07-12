import requests
from opencage.geocoder import OpenCageGeocode
from random import randint, sample
# import flask dependencies
from flask import Flask, request, make_response, jsonify
# initialize the flask app
app = Flask(__name__)
#open cage variables
openCageKey = '4ca0d1a54f004774861e022a9b7207de'
geocoder = OpenCageGeocode(openCageKey)
# function for responses

def getparamvalue(param, req):
    return req.get('queryResult').get('parameters').get(param)

# default route
@app.route('/', methods=['GET','POST'])
def index():
    return "sharebear here"

unknownIntent = "Not sure about that one. Can you try rephrasing that?"
def results():
    # build a request object
    req = request.get_json(force=True)

    # fetch action from json
    intent = req.get('queryResult').get('intent').get('displayName')
    speak_output = ""
    if intent == "GetCivicIssueIntent":
        speak_output = GetCivicIssueIntentHandler(req)
    elif intent == "GetAdviceIntent":
        speak_output = GetAdviceIntent()
    elif intent ==  "GetCovidStatsIntent":
        speak_output = GetCovidStatsIntentHandler(req)
    elif intent == "GetIssueTopicsIntent":
        speak_output = GetIssueTopicsIntentHandler(req)
    elif intent == "GetWeatherIntent":
        speak_output = GetWeatherIntentHandler(req)
    else:
        speak_output = unknownIntent
    # return a fulfillment response
    return {'fulfillmentText': '{fulfillmentText}'.format(fulfillmentText=speak_output)}
def GetAdviceIntent():
    return requests.get('https://api.adviceslip.com/advice').json()['slip']['advice']

def GetCovidStatsIntentHandler(req):
    city = getparamvalue('geo-city', req)
    state = getparamvalue('geo-state', req)
    country = getparamvalue('geo-country', req)
    place = 'Riverside'
    if country != ""
        url='https://www.trackcorona.live/api/countries/{country}'.format(country=country)
        place=country
    elif state != "":
        url='https://www.trackcorona.live/api/provinces/{state}'.format(state=state)
        place=state
    elif city != "":
        url='https://www.trackcorona.live/api/cities/{city}'.format(city=city)
        place=city
    else:
        url='https://www.trackcorona.live/api/cities/{city}'.format(city='Riverside')
    r = requests.get(url).json()['data'][0]
    confirmed = r['confirmed']
    dead = r['dead']
    return "For {place}, there are {conf} confirmed cases and {dead} total have died. Wear a mask and adhere to social distancing!".format(place=place,conf=confirmed, dead=dead)

def GetWeatherIntentHandler(handler_input):
    city = getparamvalue('city', handler_input)
    longitude = 0
    latitude = 0
    if city != "":
        result = geocoder.geocode(city, no_annotations='1')

        if result and len(result):
            longitude = result[0]['geometry']['lng']
            latitude  = result[0]['geometry']['lat']
        else:
            city = "Eastvale"
    else:
        city = "Eastvale"
    if longitude == 0 and latitude == 0:
        longitude = -117.58
        latitude = 33.95
    params = {'lat': latitude, 'lon':longitude, 'units':'imperial','exclude': 'minutely,daily,hourly,guid','appid': '1f4f2ef2146f3fb37180e51479079695'}
    url = 'https://api.openweathermap.org/data/2.5/onecall'
    r = requests.get(url, params=params)
    weather_res = r.json()
    description = weather_res['current']['weather'][0]['description']
    temp = weather_res['current']['temp']
    return "The current forecast for {city} is {description} with a temperature of {temp} degrees farenheit.".format(city=city,description=description,temp=temp)

def GetIssueTopicsIntentHandler(handler_input):
    url = 'https://us-central1-aiot-fit-xlab.cloudfunctions.net/getcivicissues'
    r = requests.get(url)
    issues = r.json()['issues']
    topics = list(set([i['category'] for i in issues]))
    some_topics = sample(topics, 3)
    return "Some of the types of current issues are: {t1}, {t2}, and {t3}. Which would you like to hear about?".format(t1=some_topics[0],t2=some_topics[1],t3=some_topics[2])
def GetCivicIssueIntentHandler(handler_input):
    topic = getparamvalue('topic', handler_input)
    url = 'https://us-central1-aiot-fit-xlab.cloudfunctions.net/getcivicissues'
    r = requests.get(url)
    issues = r.json()['issues']
    issue= ""
    if topic != "":
        matching_issues = [i for i in issues if i['category'] == topic]
        issue = sample(matching_issues, 1) # this will be a list
    if len(issue) == 0:
        issue = issues[randint(0,len(issues)-1)]
    else:
        issue = issue[0]
    return issue['name'] + '. ' + issue['description']

# create a route for webhook
@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    # return response
    return make_response(jsonify(results()))

# run the app
if __name__ == '__main__':
   app.run(debug=True, port=5050)
