'use strict';


// add events on multiple elements

const addEventOnElements = function(elements, eventType, callback){
    for(const elem of elements) elem.addEventListener(eventType,
        callback);
}


// Toggle search box in mobile device and small screens

const searchBox= document.querySelector("[search-box]");
const searchTogglers = document.querySelectorAll("[search-toggler]");

addEventOnElements(searchTogglers, "click", function(){
    searchBox.classList.toggle("active");
});

// store movieId in local storage when u click any movie card

const getMovieDetail = function(movieId){
    window.localStorage.setItem("movieId", String(movieId));
}

const getMovieList = function(urlParam, genreName){
    window.localStorage.setItem("urlParam", urlParam);
    window.localStorage.setItem("genreName", genreName);
}

// store seriesId in local storage when user clicks a TV show card

const getSeriesDetail = function(seriesId){
    window.localStorage.setItem("seriesId", String(seriesId));
}

const getSeriesList = function(urlParam, genreName){
    window.localStorage.setItem("seriesUrlParam", urlParam);
    window.localStorage.setItem("seriesGenreName", genreName);
}

// Enable horizontal scrolling with mouse wheel on all horizontal slider lists
window.addEventListener("wheel", function (e) {
    const slider = e.target.closest(".slider-list");
    if (slider) {
        // If the slider has scrollable horizontal content
        if (slider.scrollWidth > slider.clientWidth) {
            e.preventDefault();
            slider.scrollLeft += e.deltaY;
        }
    }
}, { passive: false });

// Handle click on slider navigation arrow buttons
window.addEventListener("click", function(e) {
    const btn = e.target.closest("[data-slider-btn]");
    if (!btn) return;
    const direction = btn.dataset.sliderBtn; // "prev" or "next"
    
    // Find sibling or parent container's slider-list
    const parent = btn.closest(".movie-list") || btn.closest(".detail-box") || btn.closest("section") || btn.parentElement.parentElement;
    if (!parent) return;
    const slider = parent.querySelector(".slider-list");
    if (!slider) return;
    
    const scrollAmount = Math.max(slider.clientWidth * 0.75, 300);
    if (direction === "next") {
        slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
        slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
});