# hydrometric-function
A google cloud function that fetches the latest primary water level reading for hydrometric stations across Canada

## But why?
Primary water level measurements are available through Environment Canada's [Water Office website](https://wateroffice.ec.gc.ca) and the data can be downloaded as a csv file for both real-time and historical hydrometric data. Unfortunately trying to incorporate this real-time data into your website or app can be difficult due to the lack of an official public api. This simple function sidesteps this issue making the real-time primary water level of any hydrometric station included in this service available and easy to access from any client-side application or website.

## Okay, how?
It's simple! Make a get request to this url: https://us-central1-hydrometric-api.cloudfunctions.net/fetchWaterLevel with query parameters specifying the station ID and the standard timezone the station is located in (Environment Canada doesn't adjust timecodes for daylight savings time so only standard timezones are valid parameters).

__Client-side JavaScript Example__
```javascript
fetch("https://us-central1-hydrometric-api.cloudfunctions.net/fetchWaterLevel?stationId=08HA009&timezone=pst")
    .then(res => res.json())
    .then(res => {
      const { date, level } = res;
      console.log(`The primary water level for station 08HA009 is ${level}. Last reading taken ${new Date(date).toString()}`);
    });
```

As long as the station has had a taken a reading within the last ~24 hours the fetch call will log the level and time of the reading to the console.

### Parameters
```
stationId
```
The ID of any hydrometric station with real-time data available on https://wateroffice.ec.gc.ca

```
timezone
```
The local standard timezone the station specified is located in. Environment Canada doesn't adjust for DST and neither do we!
Canada has six standard timezones, the three letter abbreviations of which are all valid values:
- PST (Pacific Standard Time)
- MST (Mountain Standard Time)
- CST (Central Standard Time)
- EST (Eastern Standard Time)
- AST (Atlantic Standard Time)
- NST (Newfoundland Standard Time)

