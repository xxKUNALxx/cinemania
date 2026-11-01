'use strict';

import { api_key, fetchDataFromServer, imageBaseURL } from "./api.js";
import { createMovieCard } from "./movie-card.js";
import { createSeriesCard } from "./series-card.js";

export function search(){
    const searchWrapper = document.querySelector("[search-wrapper]");
    const searchField = document.querySelector("[search-field]");

    const searchResultModal = document.createElement("div");
    searchResultModal.classList.add("search-modal");
    document.querySelector("main").appendChild(searchResultModal);

    let searchTimeout;

    searchField.addEventListener("input", function(){

        if (!searchField.value.trim()){
            searchResultModal.classList.remove("active");
            searchWrapper.classList.remove("searching");
            clearTimeout(searchTimeout);
            return;
        }

        searchWrapper.classList.add("searching");
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function(){
            // Use multi-search to get both movies and TV shows
            fetchDataFromServer(`https://api.themoviedb.org/3/search/multi?api_key=${api_key}&query=${searchField.value}&page=1&include_adult=false`, function({
                results: mediaList }) {

                    searchWrapper.classList.remove("searching");
                    searchResultModal.classList.add("active");
                    searchResultModal.innerHTML = ""; //remove old results
                    searchResultModal.innerHTML = `
        <p class="label">Results for</p>
        <h1 class="heading">
            ${searchField.value}
        </h1>

        <div class="movie-list">
            <div class="grid-list">
        </div>
        </div>
                    `;

                    for( const media of mediaList){
                        // skip people results
                        if (media.media_type === "person") continue;

                        let card;
                        if (media.media_type === "tv") {
                            card = createSeriesCard(media);
                        } else {
                            // movie or unknown — use movie card
                            if (!media.title) media.title = media.name || "Unknown";
                            if (!media.release_date) media.release_date = media.first_air_date || "0000-00-00";
                            card = createMovieCard(media);
                        }
                        searchResultModal.querySelector(".grid-list").appendChild(card);
                    }

                });
        },500);

    });

}
