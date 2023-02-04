'use strict';

// as this project has no server in it, we will perform our dotenv setup here
require('dotenv').config();

const axios = require('axios');


module.exports = {
  async up(queryInterface, Sequelize) {
    // making seeding date to store the time we seeded db
    const seedDate = new Date().toISOString();

    /**
     * Make request for all airlines(755 airline object)
     * iterate through all 755
     * => make airline details request (755 reqyest)
     * into my airline model
     */

    // http axios config for first request to fetch all available airlines
    const fetchAirportConfig = {
      method: 'GET',
      url: 'https://api.travelpayouts.com/data/en/airports.json?_gl=1*dmk6p5*_ga*MTc2NDY0Mjk1LjE2NjMyMDU5OTU.*_ga_1WLL0NEBEH*MTY2MzQ2MDY5Ni44LjEuMTY2MzQ2MDY5Ny41OS4wLjA.'
    }

    const fetchCityConfig = {
      method: 'GET',
      url: 'https://api.travelpayouts.com/data/en/cities.json?_gl=1*3ubyj9*_ga*MTc2NDY0Mjk1LjE2NjMyMDU5OTU.*_ga_1WLL0NEBEH*MTY2MzQ2MDY5Ni44LjEuMTY2MzQ2MDg4MC4yMy4wLjA.'
    }

    // array to hold our airline json models to be upload to psotgres with queryGenerator(queryInterface)
    const IATAToUpload = [];

    // our response for fetching all available airlines
    const airportResponse = await axios.request(fetchAirportConfig);
    const citiesResponse = await axios.request(fetchCityConfig);

    if (airportResponse.status === 200 &&
      airportResponse.data) {
      airportResponse.data.forEach(airport => {
        IATAToUpload.push({
          IATACode: airport.code,
          Name: airport.name,
          type: 'Airport',
          createdAt: seedDate,
          updatedAt: seedDate
        })
      })
    }

    if (citiesResponse.status === 200 &&
      citiesResponse.data) {
      citiesResponse.data.forEach(city => {
        IATAToUpload.push({
          IATACode: city.code,
          Name: city.name,
          type: 'City',
          createdAt: seedDate,
          updatedAt: seedDate
        })
      })
    }


    await queryInterface.bulkInsert('IATA', IATAToUpload, {})

  },
  async down(queryInterface, Sequelize) {
    // when you undo this seed, we would like to clear out our airlines db table
    await queryInterface.bulkDelete('IATA', null, {});
  }
};
