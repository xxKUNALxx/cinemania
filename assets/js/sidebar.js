'use strict';

import { api_key, fetchDataFromServer } from "./api.js";

export function sidebar() {

    // fetch movie genres
    const movieGenreList = {};
    // fetch tv genres
    const tvGenreList = {};

    fetchDataFromServer(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`, function ({ genres }) {
        for( const{id,name} of genres) {
            movieGenreList[id]= name;
        }

        fetchDataFromServer(`https://api.themoviedb.org/3/genre/tv/list?api_key=${api_key}`, function ({ genres }) {
            for( const{id,name} of genres) {
                tvGenreList[id]= name;
            }
            buildSidebar();
        });
    });

    function buildSidebar() {
        const sidebarInner = document.createElement("div");
        sidebarInner.classList.add("sidebar-inner");

        sidebarInner.innerHTML = `
            <div class="sidebar-list" id="movie-genre-list">
                <p class="title">Movies — Genre</p>
            </div>

            <div class="sidebar-list">
                <p class="title">Movies — Language</p>
                <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=hi", "Hindi")'>Hindi</a>
                <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=en", "English")'>English</a>
                <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=bn", "Bengali")'>Bengali</a>
            </div>

            <div class="sidebar-list" id="tv-genre-list">
                <p class="title">Web Series — Genre</p>
            </div>

            <div class="sidebar-list">
                <p class="title">Web Series — Language</p>
                <a href="./series-list.html" menu-close class="sidebar-link" onclick='getSeriesList("with_original_language=hi", "Hindi")'>Hindi</a>
                <a href="./series-list.html" menu-close class="sidebar-link" onclick='getSeriesList("with_original_language=en", "English")'>English</a>
                <a href="./series-list.html" menu-close class="sidebar-link" onclick='getSeriesList("with_original_language=bn", "Bengali")'>Bengali</a>
            </div>

            <div class="sidebar-footer">
                <p class="copyright">
                    Copyright 2024 <a href="">Kineflix</a>
                </p>
            </div>
        `;

        // populate movie genre links
        for (const [genreId, genreName] of Object.entries(movieGenreList)) {
            const link = document.createElement("a");
            link.classList.add("sidebar-link");
            link.setAttribute("href", "./movie-list.html");
            link.setAttribute("menu-close", "");
            link.setAttribute("onclick", `getMovieList("with_genres=${genreId}","${genreName}")`);
            link.textContent = genreName;
            sidebarInner.querySelector("#movie-genre-list").appendChild(link);
        }

        // populate tv genre links
        for (const [genreId, genreName] of Object.entries(tvGenreList)) {
            const link = document.createElement("a");
            link.classList.add("sidebar-link");
            link.setAttribute("href", "./series-list.html");
            link.setAttribute("menu-close", "");
            link.setAttribute("onclick", `getSeriesList("with_genres=${genreId}","${genreName}")`);
            link.textContent = genreName;
            sidebarInner.querySelector("#tv-genre-list").appendChild(link);
        }

        const sidebar = document.querySelector(".sidebar");
        sidebar.appendChild(sidebarInner);
        toggleSidebar(sidebar);
    }

    const toggleSidebar = function(sidebar) {
        // Toggle sidebar in mobile screen

        const sidebarBtn = document.querySelector("[menu-btn]");
        const sidebarTogglers = document.querySelectorAll("[menu-toggler]");
        const sidebarClose = document.querySelectorAll("[menu-close]");
        const overlay = document.querySelector("[overlay]");

        addEventOnElements(sidebarTogglers, "click", function () {
            sidebar.classList.toggle("active");
            sidebarBtn.classList.toggle("active");
            overlay.classList.toggle("active");
        });

        addEventOnElements(sidebarClose, "click", function () {
            sidebar.classList.remove("active");
            sidebarBtn.classList.remove("active");
            overlay.classList.remove("active");
        });
    }
}
