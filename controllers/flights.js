const express = require('express');
const router = express.Router();
const db = require('../models');
const axios = require('axios');
const { urlencoded } = require('express');
const { DatabaseError } = require('pg');
require('dotenv').config();
const moment = require('moment');
const isLoggedIn = require('../middleware/isLoggedIn');
const methodOverride = require('method-override');
router.use(methodOverride('_method'));


router.get('/index', isLoggedIn, async (req, res) => {
    //get all of the flights from the database
    let flights = await db.Flight.findAll();
    flights = flights.map(f => f.toJSON()); // removes all of the unnecessary data
    console.log(flights); // shows me all of the flight data -> previous Values
    //render the (flights/index) page
    res.render('../views/index', { flights: flights });
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('flights/new', { didSearchFail: false });
});

router.get('/edit/:id', isLoggedIn, (req, res) => {
    res.render('./flights/edit', { flightId: parseInt(req.params.id) });
});


router.get('/show/:id', isLoggedIn, async (req, res) => {
    // pring flight to verify
    let flight = await db.Flight.findOne({
        where: { id: parseInt(req.params.id) }
    });

    flight = flight.toJSON();
    console.log('===== this is the show route ====');
    console.log(flight);
    // go to the database and grab one flight
    res.render('./flights/show', { flight: flight });
    // render the flights/show page with the flight
});


router.post('/new', isLoggedIn, async (req, res) => {
    const flightPromises = [];
    console.log('INFO NEEDED', Object.assign({}, req.body));
    const IATAOrigin = await locationToIATA(req.body.origin);
    const IATADestination = await locationToIATA(req.body.destination);
    const departureFlight = axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
        params: {
            origin: IATAOrigin,
            destination: IATADestination,
            departure_at: req.body.departureDate,
            return_at: '',
            sorting: 'price',
            direct: true,
            currency: 'usd',
            limit: 1,
            page: 1,
            token: process.env.API_TOKEN
        }
    })

    const returnFlight = axios.get('https://api.travelpayouts.com/aviasales/v3/prices_for_dates', {
        params: {
            origin: IATADestination,
            destination: IATAOrigin,
            departure_at: req.body.returnDate,
            return_at: '',
            sorting: 'price',
            direct: true,
            currency: 'usd',
            limit: 1,
            page: 1,
            token: process.env.API_TOKEN
        }
    })
    console.log(IATAOrigin);
    console.log(IATADestination);
    console.log(req.body);
    flightPromises.push(departureFlight);
    flightPromises.push(returnFlight);
    Promise.all(flightPromises).then(([departureResponse, returnResponse]) => {
        console.log('DEPARTURE RESULTS');
        console.log(departureResponse.data.data);
        console.log('RETURN RESULTS');
        console.log(returnResponse.data.data);
        if (departureResponse.data.data[0] && returnResponse.data.data[0]) {
            res.render('flights/departureResults', {
                departureFlight: departureResponse.data.data[0],
                returnFlight: returnResponse.data.data[0]
            });
        } else {
            // res.redirect('back');
            res.render('flights/new', { didSearchFail: true })
        }
    })


    async function locationToIATA(location) {
        const IATAData = await db.IATA.findOne({
            where: {
                Name: location
            }
        })
        return IATAData.IATACode;
    }
});

//2022-09-29T08:46:00-07:00

router.post('/show', isLoggedIn, async (req, res) => {
    // print req.body to view form inputs
    console.log('**** /show', req.body);
    const newDate = new Date().toISOString();
    // create flight for database
    let newFlight = await db.Flight.create({
        origin: req.body.origin,
        destination: req.body.destination,
        departureAt: req.body.departureAt,
        returnAt: req.body.returnAt,
        userId: req.user.id,
        createdAt: newDate,
        updatedAt: newDate
    });
    newFlight = newFlight.toJSON();
    console.log(newFlight);
    // res.redirect to all following flights
    res.redirect('flights/show', { flights: newFlight });
});

router.post('/index', isLoggedIn, async (req, res) => {
    //get all of the flights from the database
    let flights = await db.Flight.findAll();
    flights = flights.map(f => f.toJSON()); // removes all of the unnecessary data
    console.log(flights); // shows me all of the flight data -> previous Values
    //render the (flights/index) page
    res.render('flights/index', { flights: flights });
});

router.post('/addFlight', async (req, res) => {
    //add info into table
    await db.Flight.create({
        origin: req.body.origin,
        destination: req.body.destination,
        departureAt: req.body.departureAt,
        returnAt: req.body.returnAt,
        userId: req.user.id
    });
    const flights = await db.Flight.findAll({
        where: { userId: req.user.id }
    })
    console.log(flights);
    //res.render into flights/index
    res.render('flights/index', { flights: flights });
})

router.put('/edit/:id', (req, res) => {
    res.render('./flights/edit');
});


router.delete('/deleteFlight/:id', async (req, res) => {
    await db.Flight.destroy({
        where: { id: parseInt(req.params.id) }
    });
    const flights = await db.Flight.findAll();
    console.log(flights);
    res.render('flights/index', { flights: flights });
});

router.get('*', (req, res) => {
    res.render('./404');
})


module.exports = router;