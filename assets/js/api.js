'use strict';

const api_key = '7723f3fb6b08cf5d41ff3803d0323bb6';
const imageBaseURL = 'https://image.tmdb.org/t/p/';

// fetch data from server using url and passes the result in json data to a callback func along with an optional parameter if has optinalParam

const fetchDataFromServer = function (url, callback, optionalParam){
    
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data, optionalParam));
}

export{ imageBaseURL, api_key, fetchDataFromServer};