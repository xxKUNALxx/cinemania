'use strict';

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";

const movieId = window.localStorage.getItem("movieId");
const pageContent = document.querySelector("[page-content]");

sidebar();

const getGenres = function(genreList){
    const newGenreList = [];
    for (const { name } of genreList) newGenreList.push(name);
    return newGenreList.join(", ");
}

const getCasts = function(castList){
    const newCastList = [];
    for(let i = 0, len = castList.length; i < len && i < 10; i++){
        const { name } = castList[i];
        newCastList.push(name);
    }
    return newCastList.join(", ");
}

const getDirectors = function(crewList){
    const directors = crewList.filter(({job}) => job === "Director");
    const directorList = [];
    for(const { name } of directors) directorList.push(name);
    return directorList.join(", ");
}

const filterVideos = function(videoList){
    return videoList.filter(({type, site}) => (type === "Trailer" || type === "Teaser") && site === "YouTube");
}

fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`, function (movie){

    const {
        backdrop_path,
        poster_path,
        title,
        release_date,
        runtime,
        vote_average,
        releases : { countries: [{ certification }] },
        genres,
        overview,
        casts: { cast, crew },
        videos: { results: videos }
    } = movie;

    document.title = `${title} - Kineflix`;

    const movieDetail = document.createElement("div");
    movieDetail.classList.add("movie-detail");

    movieDetail.innerHTML = `
    <div class="backdrop-image" style="background-image: url('${imageBaseURL}w1280${backdrop_path || poster_path}')"></div>

    <figure class="poster-box movie-poster">
        <img src="${imageBaseURL}w342${poster_path}" alt="${title} poster" class="img-cover">
    </figure>

    <div class="detail-box">
        <div class="detail-content">
            <h1 class="heading">${title}</h1>

            <div class="meta-list">
                <div class="meta-item">
                    <img src="./assets/images/star.png" width="20" height="20" alt="rating">
                    <span class="span">${vote_average.toFixed(1)}</span>
                </div>
                <div class="separator"></div>
                <div class="meta-item">${runtime} min</div>
                <div class="separator"></div>
                <div class="meta-item">${release_date.split("-")[0]}</div>
                <div class="meta-item card-badge">${certification}</div>
            </div>

            <p class="genre">${getGenres(genres)}</p>
            <p class="overview">${overview}</p>

            <ul class="detail-list">
                <div class="list-item">
                    <p class="list-name">Starring</p>
                    <p>${getCasts(cast)}</p>
                </div>
                <div class="list-item">
                    <p class="list-name">Directed By</p>
                    <p>${getDirectors(crew)}</p>
                </div>
            </ul>
        </div>

        <button class="play_button" id="watch-now-btn">&#9654; Watch Now</button>

        <div id="player-container" style="display:none;">
            <iframe id="movie-player" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
        </div>

        <div class="title-wrapper">
            <h3 class="title-large">Trailers, Clips and Images</h3><div class="slider-btn-group"><button class="slider-arrow-btn" data-slider-btn="prev" aria-label="Previous">&#10094;</button><button class="slider-arrow-btn" data-slider-btn="next" aria-label="Next">&#10095;</button></div>
        </div>

        <div class="slider-list">
            <div class="slider-inner"></div>
        </div>
    </div>
    `;

    // Trailers
    for (const {key, name} of filterVideos(videos)){
        const videoCard = document.createElement("div");
        videoCard.classList.add("video-card");
        videoCard.innerHTML = `<iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0" frameborder="0" allowfullscreen="1" title="${name}" class="img-cover" loading="lazy"></iframe>`;
        movieDetail.querySelector(".slider-inner").appendChild(videoCard);
    }

    // Images
    fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${api_key}`, function(data){
        data.backdrops.forEach(element => {
            const imgCard = document.createElement("div");
            imgCard.classList.add("video-card");
            imgCard.innerHTML = `<img width="500" height="294" class="img-cover" src="https://image.tmdb.org/t/p/w342/${element.file_path}" alt="">`;
            movieDetail.querySelector(".slider-inner").appendChild(imgCard);
        });
    });

    pageContent.appendChild(movieDetail);

    // Inline Watch Now
    const watchBtn = document.getElementById("watch-now-btn");
    const playerContainer = document.getElementById("player-container");
    const moviePlayer = document.getElementById("movie-player");

    watchBtn.addEventListener("click", function () {
        if (playerContainer.style.display === "none") {
            moviePlayer.src = `https://vidsrc.mov/embed/movie/${movieId}`;
            playerContainer.style.display = "block";
            watchBtn.textContent = "✕ Close Player";
        } else {
            playerContainer.style.display = "none";
            moviePlayer.src = "";
            watchBtn.innerHTML = "&#9654; Watch Now";
        }
    });

    fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${api_key}&page=1`, addSuggestedMovies);
});

const addSuggestedMovies = function({results: movieList}){
    const movieListElem = document.createElement("section");
    movieListElem.classList.add("movie-list");
    movieListElem.ariaLabel = "You May Also Like";

    movieListElem.innerHTML = `
    <div class="title-wrapper">
        <h3 class="title-large">You May Also Like</h3><div class="slider-btn-group"><button class="slider-arrow-btn" data-slider-btn="prev" aria-label="Previous">&#10094;</button><button class="slider-arrow-btn" data-slider-btn="next" aria-label="Next">&#10095;</button></div>
    </div>
    <div class="slider-list">
        <div class="slider-inner"></div>
    </div>
    `;

    for (const movie of movieList){
        const movieCard = createMovieCard(movie);
        movieListElem.querySelector(".slider-inner").appendChild(movieCard);
    }

    pageContent.appendChild(movieListElem);
}

search();