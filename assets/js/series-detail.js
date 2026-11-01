'use strict';

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createSeriesCard } from "./series-card.js";
import { search } from "./search.js";

const seriesId = window.localStorage.getItem("seriesId");
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

const getCreators = function(createdBy){
    if (!createdBy || createdBy.length === 0) return "N/A";
    return createdBy.map(c => c.name).join(", ");
}

const filterVideos = function(videoList){
    return videoList.filter(({type, site}) => (type === "Trailer" || type === "Teaser") && site === "YouTube");
}

fetchDataFromServer(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${api_key}&append_to_response=credits,videos,images`, function (series){

    const {
        backdrop_path,
        poster_path,
        name,
        first_air_date,
        number_of_seasons,
        number_of_episodes,
        vote_average,
        genres,
        overview,
        created_by,
        seasons,
        credits: { cast },
        videos: { results: videos }
    } = series;

    document.title = `${name} - Kineflix`;

    const seriesDetail = document.createElement("div");
    seriesDetail.classList.add("movie-detail");

    seriesDetail.innerHTML = `
    <div class="backdrop-image" style="background-image: url('${imageBaseURL}w1280${backdrop_path || poster_path}')"></div>

    <figure class="poster-box movie-poster">
        <img src="${imageBaseURL}w342${poster_path}" alt="${name} poster" class="img-cover">
    </figure>

    <div class="detail-box">
        <div class="detail-content">
            <h1 class="heading">${name}</h1>

            <div class="meta-list">
                <div class="meta-item">
                    <img src="./assets/images/star.png" width="20" height="20" alt="rating">
                    <span class="span">${vote_average.toFixed(1)}</span>
                </div>
                <div class="separator"></div>
                <div class="meta-item">${number_of_seasons} Season${number_of_seasons > 1 ? "s" : ""}</div>
                <div class="separator"></div>
                <div class="meta-item">${number_of_episodes} Episodes</div>
                <div class="separator"></div>
                <div class="meta-item">${first_air_date ? first_air_date.split("-")[0] : "N/A"}</div>
                <div class="meta-item card-badge">TV</div>
            </div>

            <p class="genre">${getGenres(genres)}</p>
            <p class="overview">${overview}</p>

            <ul class="detail-list">
                <div class="list-item">
                    <p class="list-name">Starring</p>
                    <p>${getCasts(cast)}</p>
                </div>
                <div class="list-item">
                    <p class="list-name">Created By</p>
                    <p>${getCreators(created_by)}</p>
                </div>
            </ul>
        </div>

        <div class="episode-picker" style="margin:16px 0; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <select id="season-select" style="padding:8px 12px; border-radius:8px; background:#1e1e2e; color:#fff; border:1px solid #444; font-size:14px;"></select>
            <select id="episode-select" style="padding:8px 12px; border-radius:8px; background:#1e1e2e; color:#fff; border:1px solid #444; font-size:14px;"></select>
            <button id="watch-btn" class="play_button" style="margin:0;">&#9654; Watch Now</button>
        </div>

        <div id="series-player-container" style="display:none;">
            <iframe id="series-player" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture"></iframe>
        </div>

        <div class="title-wrapper">
            <h3 class="title-large">Trailers, Clips and Images</h3><div class="slider-btn-group"><button class="slider-arrow-btn" data-slider-btn="prev" aria-label="Previous">&#10094;</button><button class="slider-arrow-btn" data-slider-btn="next" aria-label="Next">&#10095;</button></div>
        </div>

        <div class="slider-list">
            <div class="slider-inner"></div>
        </div>
    </div>
    `;

    const validSeasons = (seasons || []).filter(s => s.season_number > 0);
    const seasonSelect = seriesDetail.querySelector("#season-select");
    const episodeSelect = seriesDetail.querySelector("#episode-select");
    const watchBtn = seriesDetail.querySelector("#watch-btn");
    const playerContainer = seriesDetail.querySelector("#series-player-container");
    const seriesPlayer = seriesDetail.querySelector("#series-player");

    // Build season options
    validSeasons.forEach(season => {
        const opt = document.createElement("option");
        opt.value = season.season_number;
        opt.textContent = `Season ${season.season_number}`;
        opt.dataset.episodeCount = season.episode_count;
        seasonSelect.appendChild(opt);
    });

    // Populate episodes for a given count
    function populateEpisodes(count) {
        episodeSelect.innerHTML = "";
        for (let i = 1; i <= count; i++) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `Episode ${i}`;
            episodeSelect.appendChild(opt);
        }
    }

    if (validSeasons.length > 0) populateEpisodes(validSeasons[0].episode_count);

    // Season change → repopulate episodes, reset player
    seasonSelect.addEventListener("change", function () {
        const selected = seasonSelect.options[seasonSelect.selectedIndex];
        populateEpisodes(Number(selected.dataset.episodeCount));
        // reset player so user must click Watch Now again
        playerContainer.style.display = "none";
        seriesPlayer.src = "";
        watchBtn.innerHTML = "&#9654; Watch Now";
    });

    // Episode change → reload player if open
    episodeSelect.addEventListener("change", function () {
        if (playerContainer.style.display !== "none") {
            seriesPlayer.src = `https://vidsrc.mov/embed/tv/${seriesId}/${seasonSelect.value}/${episodeSelect.value}`;
        }
    });

    // Watch Now → show inline player
    watchBtn.addEventListener("click", function () {
        if (playerContainer.style.display === "none") {
            seriesPlayer.src = `https://vidsrc.mov/embed/tv/${seriesId}/${seasonSelect.value}/${episodeSelect.value}`;
            playerContainer.style.display = "block";
            watchBtn.textContent = "✕ Close Player";
        } else {
            playerContainer.style.display = "none";
            seriesPlayer.src = "";
            watchBtn.innerHTML = "&#9654; Watch Now";
        }
    });

    // Trailers
    for (const {key, name: videoName} of filterVideos(videos)){
        const videoCard = document.createElement("div");
        videoCard.classList.add("video-card");
        videoCard.innerHTML = `<iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0" frameborder="0" allowfullscreen="1" title="${videoName}" class="img-cover" loading="lazy"></iframe>`;
        seriesDetail.querySelector(".slider-inner").appendChild(videoCard);
    }

    // Backdrop images
    fetchDataFromServer(`https://api.themoviedb.org/3/tv/${seriesId}/images?api_key=${api_key}`, function(data){
        (data.backdrops || []).forEach(element => {
            const imgCard = document.createElement("div");
            imgCard.classList.add("video-card");
            imgCard.innerHTML = `<img width="500" height="294" class="img-cover" src="https://image.tmdb.org/t/p/w342/${element.file_path}" alt="">`;
            seriesDetail.querySelector(".slider-inner").appendChild(imgCard);
        });
    });

    pageContent.appendChild(seriesDetail);

    fetchDataFromServer(`https://api.themoviedb.org/3/tv/${seriesId}/recommendations?api_key=${api_key}&page=1`, addSuggestedSeries);
});

const addSuggestedSeries = function({results: seriesList}){
    const seriesListElem = document.createElement("section");
    seriesListElem.classList.add("movie-list");
    seriesListElem.ariaLabel = "You May Also Like";

    seriesListElem.innerHTML = `
    <div class="title-wrapper">
        <h3 class="title-large">You May Also Like</h3><div class="slider-btn-group"><button class="slider-arrow-btn" data-slider-btn="prev" aria-label="Previous">&#10094;</button><button class="slider-arrow-btn" data-slider-btn="next" aria-label="Next">&#10095;</button></div>
    </div>
    <div class="slider-list">
        <div class="slider-inner"></div>
    </div>
    `;

    for (const series of seriesList){
        const seriesCard = createSeriesCard(series);
        seriesListElem.querySelector(".slider-inner").appendChild(seriesCard);
    }

    pageContent.appendChild(seriesListElem);
}

search();