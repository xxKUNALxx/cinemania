// 'use strict';

import { api_key, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";
let currentPage = 1;
const genreName = window.localStorage.getItem("genreName");
const urlParam = window.localStorage.getItem("urlParam");

const pageContent = document.querySelector("[page-content]");


sidebar();
let totalPages = 0;

fetchDataFromServer (`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&sort_by=poputarity. desc&include_adult=false&page=${currentPage}&${urlParam}`, function ({
results: movieList, totat_pages }) {
    // console.log(movieList)
    totalPages = totat_pages;
    document.title = `${genreName} Movies - Kineflix`;
    // console.log(movieList);
    const movieListElem = document.createElement("section");
    movieListElem.classList.add("movie-list", "genre-list");
    movieListElem.ariaLabel = `${genreName} Movies`;

    movieListElem.innerHTML = `
    <div class="title-wrapper">
    <h1 class="heading">All ${genreName} Movies</h1>
    </div>             

    <div class="grid-list"></div>

    <button class="btn load-more" load-more>Load More</button>
    `;

    // add movie card based on fetched item

    for(const movie of movieList){
        const movieCard = createMovieCard(movie);

        movieListElem.querySelector(".grid-list").appendChild(movieCard);
    }

    pageContent.appendChild(movieListElem);
     
    // load more option
    document.querySelector("[load-more]").addEventListener("click", function(){
        
            if(currentPage >= totalPages){
                this.style.display = "none";    //this == load more button
                return;
            }
            currentPage++;
            this.classList.add("loading");   
            // this == loading btn

            fetchDataFromServer(`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&sort_by=poputarity. desc&include_adult=false&page=${currentPage}&${urlParam}`, ({results: movieList})=>{

             this.classList.remove("loading");
             console.log(movieList)
             movieList.forEach( movie => {
                const movieCard = createMovieCard(movie);
                movieListElem.querySelector(".grid-list").appendChild(movieCard);
             });
            //  for(const movie of movieList){
            //     const movieCard = createMovieCard(movie);
        
            //     movieListElem.querySelector(".grid-list").appendChild(movieCard);
            // }
            });
        

    });

});

search();