const axios = require('axios');

const timezones = {
  pst: -8,
  mst: -7,
  cst: -6,
  est: -5,
  ast: -4,
  nst: -3.5
}

const getUTC = now => {
  var timezoneOffset = now.getTimezoneOffset() * 60000;
  return now.getTime() + timezoneOffset;
}

const getLocalTime = (date, timezone) => {
  const utc = getUTC(date);
  return utc + (3600000 * timezones[timezone]);
}

const getUrl = (date, stationId) => {
  const yesterday = new Date(date.getTime() - (3600000 * 24));
  const yr = date.getFullYear(), mn = date.getMonth(), dy = date.getDate();
  const yyr = yesterday.getFullYear(), ymn = yesterday.getMonth(), ydy = yesterday.getDate();
  const dateStr = `${yr}-${mn < 9 ? `0${mn + 1}` : mn + 1}-${dy < 10 ? `0${dy}` : dy}`;
  const yDateStr = `${yyr}-${ymn < 9 ? `0${ymn + 1}` : ymn + 1}-${ydy < 10 ? `0${ydy}` : ydy}`;
  return `https://wateroffice.ec.gc.ca/services/real_time_graph/json/inline?station=${stationId}&start_date=${yDateStr}&end_date=${dateStr}&param1=46`;
}

const fetchWaterLevel = (cb, stationId, timezone) => {
  const localTime = new Date(getLocalTime(new Date(), timezone));
  const url = getUrl(localTime, stationId);
  axios.get(url)
    .then(response => {
      const levels = response.data['46'].provisional;
      const latest = levels[levels.length - 1];
      const data = {
        date: latest[0],
        level: latest[1]
      };
      cb(200, data);
    })
    .catch(error => {
      console.error(error);
      cb(400, "Whoops, looks like something went wrong");
    });
}

exports.fetchWaterLevel = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    res.set('Access-Control-Allow-Origin', '*');
    const { stationId, timezone } = req.query;
    const cb = (status, response) => res.status(status).send(response);
    if (!stationId) {
      cb(400, "Please include a stationId query param");
    } else if (!timezone) {
      cb(400, "Please include a timezone query param");
    } else {
      fetchWaterLevel(cb, stationId, timezone);
    }
  }
};