// Импорт необходимых библиотек
const express = require('express');
const pg = require('pg');

//Создание объекта сервера
const app = express();

//Присвоение необходимых для подключения к бд конфигураций
const client = new pg.Client({
    user: 'sochi_open_meteo_1460',
    host: '172.16.117.193',
    database: 'weather',
    password: 'open',
    port: 5632,
});

// //Подключение клиента бд
client.connect();

//Присваивание порта прослушивания
//const { PORT = 3005 } = process.env;

//Ключ-ссылка
const apiLink =
    "https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=40.25&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation,rain,showers,snowfall,snow_depth,freezinglevel_height,weathercode,pressure_msl,surface_pressure,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,evapotranspiration,et0_fao_evapotranspiration,vapor_pressure_deficit,windspeed_10m,windspeed_80m,windspeed_120m,windspeed_180m,winddirection_10m,winddirection_80m,winddirection_120m,winddirection_180m,windgusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=Europe%2FMoscow";

//Функция промежуточного программирования
app.use(express.json());

//Функция сбора данных по аргументу link
function dataRecording(link, requestedHour){
    //fetch функция по аргументу link
    fetch(link)
        //Представление ответа в json формат
        .then(res => res.json())
        .then(json => {
            console.log(requestedHour)
            const query = `
              INSERT INTO sochi_open_meteo_1460 (time, temperature_2m, relativehumidity_2m, dewpoint_2m, apparent_temperature,
              precipitation, rain_and_showers, snowfall, pressure_msl, surface_pressure,
              cloudcover, cloudcover_low, cloudcover_mid, cloudcover_high, et0_fao_evapotranspiration,
              vapor_pressure_deficit, windspeed_10m, windspeed_80m,
              winddirection_10m, winddirection_80m, windgusts_10m,
              soil_temperature_0_7cm,
              soil_moisture_0_9cm, soil_moisture_9_27cm)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) returning *
            `;

            client.query(query, [json.hourly.time[requestedHour], json.hourly.temperature_2m[requestedHour], json.hourly.relativehumidity_2m[requestedHour],
                json.hourly.dewpoint_2m[requestedHour], json.hourly.apparent_temperature[requestedHour], json.hourly.precipitation[requestedHour],
                (json.hourly.rain[requestedHour] + json.hourly.showers[requestedHour]), json.hourly.snowfall[requestedHour],
                json.hourly.pressure_msl[requestedHour], json.hourly.surface_pressure[requestedHour],
                json.hourly.cloudcover[requestedHour], json.hourly.cloudcover_low[requestedHour], json.hourly.cloudcover_mid[requestedHour],
                json.hourly.cloudcover_high[requestedHour],
                json.hourly.et0_fao_evapotranspiration[requestedHour], json.hourly.vapor_pressure_deficit[requestedHour],
                json.hourly.windspeed_10m[requestedHour], json.hourly.windspeed_80m[requestedHour], json.hourly.winddirection_10m[requestedHour], json.hourly.winddirection_80m[requestedHour],
                json.hourly.windgusts_10m[requestedHour],
                (json.hourly.soil_temperature_0cm[requestedHour] + json.hourly.soil_temperature_6cm[requestedHour])/2,
                (json.hourly.soil_moisture_0_1cm[requestedHour] + json.hourly.soil_moisture_1_3cm[requestedHour] + json.hourly.soil_moisture_3_9cm[requestedHour])/3,
                json.hourly.soil_moisture_9_27cm[requestedHour]], (err, res) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('Data insert successful');
            });

        })
        .catch(err =>{

        })

}

//Сбор данных за текущий час
function fetchDataOpenMeteo(){
    var newTime = new Date().getHours();
    newTime = newTime + 3;
    dataRecording(apiLink, newTime);
}
//Функция, реализующая сбор данных с заданным интервалом

fetchDataOpenMeteo()

let timerId = setInterval(() => fetchDataOpenMeteo(), 3600000);

/*
while (1){
    console.log('_____________wait_____________');
    if (h+3600-1<t){
        fetchDataOpenMeteo(4)
    }
    else if (h+1>t){
        fetchDataOpenMeteo(3)
    }
}
*/
