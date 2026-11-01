'use strict';

import { api_key, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createSeriesCard } from "./series-card.js";
import { search } from "./search.js";

let currentPage = 1;
const genreName = window.localStorage.getItem("seriesGenreName");
const urlParam = window.localStorage.getItem("seriesUrlParam");

const pageContent = document.querySelector("[page-content]");

sidebar();
let totalPages = 0;

fetchDataFromServer(`https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`, function ({
results: seriesList, total_pages }) {

    totalPages = total_pages;
    document.title = `${genreName} Series - Kineflix`;

    const seriesListElem = document.createElement("section");
    seriesListElem.classList.add("movie-list", "genre-list");
    seriesListElem.ariaLabel = `${genreName} Web Series`;

    seriesListElem.innerHTML = `
    <div class="title-wrapper">
        <h1 class="heading">All ${genreName} Web Series</h1>
    </div>

    <div class="grid-list"></div>

    <button class="btn load-more" load-more>Load More</button>
    `;

    for(const series of seriesList){
        const seriesCard = createSeriesCard(series);
        seriesListElem.querySelector(".grid-list").appendChild(seriesCard);
    }

    pageContent.appendChild(seriesListElem);

    // load more
    document.querySelector("[load-more]").addEventListener("click", function(){

        if(currentPage >= totalPages){
            this.style.display = "none";
            return;
        }
        currentPage++;
        this.classList.add("loading");

        fetchDataFromServer(`https://api.themoviedb.org/3/discover/tv?api_key=${api_key}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`, ({results: seriesList}) => {

            this.classList.remove("loading");
            seriesList.forEach(series => {
                const seriesCard = createSeriesCard(series);
                seriesListElem.querySelector(".grid-list").appendChild(seriesCard);
            });
        });
    });

});

search();
