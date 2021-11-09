(function () {
    var newMovies = movies.map(function (movie, index) {
        return {
            id: index,
            title: movie.Title.toString(),
            year: movie.movie_year,
            summary: movie.summary,
            rating: movie.imdb_rating,
            ytid: movie.ytid,
            categories: movie.Categories.split('|')
        };
    });
    window.data = {
        newMovies: newMovies
    }
})();
(function () {
    function $(e) {
        return document.querySelector(e);
    }
    var elResult = $('.movies-result');
    var elMovieTemplate = $('#movie-template').content;
    function display(movies) {
        elResult.innerHTML = '';
        var moviesFragment = document.createDocumentFragment();
        movies.forEach(function (movie) {
            var movieTemplate = document.importNode(elMovieTemplate, true);
            movieTemplate.querySelector('.movie__summary').dataset.index = movie.id;
            movieTemplate.querySelector('.movie__rating').textContent = movie.rating;
            movieTemplate.querySelector('.movie__title').textContent = movie.title;
            movieTemplate.querySelector('.movie__year').textContent = movie.year;
            movieTemplate.querySelector('.movie__categories').textContent = movie.categories.join(', ');
            movieTemplate.querySelector('.movie__trailer').href += movie.ytid;
            movieTemplate.querySelector('.movie__watchlist').dataset.id = movie.id;
            if (watchlist) {
                var isMovieWatchlisted = watchlist.watchlist.find(function (watchlistedMovie) {
                    return watchlistedMovie.id === movie.id;
                });
                if (isMovieWatchlisted) {
                    movieTemplate.querySelector('.movie__watchlist').disabled = true;
                }
            }
            moviesFragment.appendChild(movieTemplate);
        });
        elResult.appendChild(moviesFragment);
    }
    window.show = {
        $: $,
        display: display
    }
})();
(function () {
    var $ = window.show.$;
    var elSearchForm = $('.movies-form');
    var elInput = $('.movie-name');
    var elCatSelect = $('#movie-category');
    var elStartYearSelect = $('#movie-year-from');
    var elEndYearSelect = $('#movie-year-till');
    var elSortMethod = $('#sort-by');
    var elResult = $('.movies-result');
    function createOptions(el, arr) {
        var newOptFragment = document.createDocumentFragment();
        arr.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            newOptFragment.appendChild(option);
        });
        el.appendChild(newOptFragment);
    }
    function sortByMethod(movies, sortMethod) {
        if (sortMethod === 'by-alphabetical') {
            movies.sort(function (a, b) {
                if (a.title > b.title)
                    return 1;
                else if (a.title < b.title)
                    return -1;
                return;
            });
        }
        else if (sortMethod === 'by-alphabetical-reversed') {
            movies.sort(function (a, b) {
                if (a.title < b.title)
                    return 1;
                else if (a.title > b.title)
                    return -1;
                return;
            });
        }
        else if (sortMethod === 'by-decreased-rating') {
            movies.sort(function (a, b) {
                if (a.rating < b.rating)
                    return 1;
                else if (a.rating > b.rating)
                    return -1;
                return;
            });
        }
        else if (sortMethod === 'by-increased-rating') {
            movies.sort(function (a, b) {
                if (a.rating > b.rating)
                    return 1;
                else if (a.rating < b.rating)
                    return -1;
                return;
            });
        };
    }
    var movies = window.data.newMovies.slice();
    var displayMovies = window.show.display;
    var cats = [];
    var isMoviesFiltered = false;
    movies.forEach(function (movie) {
        movie.categories.forEach(function (cat) {
            if (cats.indexOf(cat) === -1)
                cats.push(cat);
        });
    });
    cats.sort();
    var years = [];
    movies.forEach(function (movie) {
        if (years.indexOf(movie.year) === -1)
            years.push(movie.year)
    });
    years.sort();
    createOptions(elCatSelect, cats);
    createOptions(elStartYearSelect, years);
    createOptions(elEndYearSelect, years);
    elSearchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var inputValue = elInput.value.trim();
        var catValue = elCatSelect.value;
        var yearFrom = elStartYearSelect.value;
        var yearTill = elEndYearSelect.value;
        var sortMethod = elSortMethod.value;
        if (yearFrom > yearTill && yearFrom != 'all' && yearTill != 'all') {
            var output = 'The year interval is incorrect! <br>Start point can\'t be larger than the end point!';
            output += '<br><br><b>' + yearFrom + '</b> is larger than <b>' + yearTill + '</b>';
            output += '<br>Please choose years attentively :)';
            var infoDiv = document.createElement('div');
            infoDiv.classList.add('info-div');
            infoDiv.innerHTML = output;
            elResult.innerHTML = '';
            elResult.append(infoDiv);
            return;
        }
        if (inputValue === '' && catValue === 'all' && yearFrom === 'all' && yearTill === 'all') {
            if (sortMethod !== 'default')
                sortByMethod(movies, sortMethod);
            else
                movies = window.data.newMovies.slice();
            window.search = {
                isMoviesFiltered: isMoviesFiltered,
                sortByMethod: sortByMethod
            }
            displayMovies(movies);
            return;
        }
        function filterFunction(movie) {
            var isTitleSuitable;
            var isCategorySuitable;
            var isYearSuitable;
            if (!inputValue)
                isTitleSuitable = true;
            else {
                var movieTitleRegex = new RegExp(inputValue, 'gi');
                isTitleSuitable = movie.title.match(movieTitleRegex);
            }
            if (catValue === 'all')
                isCategorySuitable = true;
            else
                isCategorySuitable = movie.categories.includes(catValue);

            if (yearFrom === 'all' && yearTill === 'all')
                isYearSuitable = true;
            else if (yearFrom !== 'all' && yearTill === 'all')
                isYearSuitable = movie.year >= yearFrom;
            else if (yearFrom === 'all' && yearTill !== 'all')
                isYearSuitable = movie.year <= yearTill;
            else if (yearFrom !== 'all' && yearTill !== 'all')
                isYearSuitable = movie.year >= yearFrom && movie.year <= yearTill;

            return isTitleSuitable && isCategorySuitable && isYearSuitable;
        };
        var sortedMovies = movies.filter(function (movie) {
            return filterFunction(movie);
        });
        if (sortedMovies.length > 0) {
            if (sortMethod !== 'default')
                sortByMethod(sortedMovies, sortMethod);
            else
                movies = window.data.newMovies.slice();
            isMoviesFiltered = true;
            displayMovies(sortedMovies);
            window.search = {
                isMoviesFiltered: isMoviesFiltered,
                sortedMovies: sortedMovies
            }
        }
        else {
            var output = 'Sorry but there are no results related to your response!';
            var infoText = document.createElement('div');
            infoText.classList.add('info-div');
            infoText.innerHTML = output;
            elResult.innerHTML = '';
            elResult.append(infoText);
        }
    });
})();
(function () {
    var $ = window.show.$;
    var elResult = $('.movies-result');
    var elModal = $('.modal');
    elResult.addEventListener('click', function (e) {
        if (e.target.matches('.movie__summary')) {
            var index = parseInt(e.target.dataset.index, 10);
            if (window.search && window.search.isMoviesFiltered)
                var movieForModal = window.search.sortedMovies.find(function (movie) {
                    return movie.id === index;
                });
            else
                var movieForModal = window.data.newMovies.find(function (movie) {
                    return movie.id === index;
                });
            elModal.querySelector('.modal__title').textContent = movieForModal.title;
            elModal.querySelector('.modal__rating').textContent = movieForModal.rating;
            elModal.querySelector('.modal__year').textContent = movieForModal.year;
            elModal.querySelector('.modal__categories').textContent = movieForModal.categories.join(', ');
            elModal.querySelector('.modal__summary').textContent = movieForModal.summary;
            elModal.classList.add('modal--show');
            function closeModalOnClick(e) {
                if (e.target.matches('.modal') || e.target.matches('.modal__close')) {
                    this.classList.add('fade-left-up');
                    this.addEventListener('animationend', removeClasses);
                }
            }
            function closeModalOnKeyUp(e) {
                if (e.keyCode === 27) {
                    elModal.classList.add('fade-left-up');
                    elModal.addEventListener('animationend', removeClasses);
                }
            }
            function removeClasses() {
                elModal.classList.remove('modal--show');
                elModal.classList.remove('fade-left-up');
                elModal.removeEventListener('animationend', removeClasses);
                elModal.removeEventListener('click', closeModalOnClick);
                document.removeEventListener('keyup', closeModalOnKeyUp);
            }
            elModal.addEventListener('click', closeModalOnClick);
            document.addEventListener('keyup', closeModalOnKeyUp);
        }
    })
})();
(function () {
    var $ = window.show.$;
    var movies = window.data.newMovies;
    var elResult = $('.movies-result');
    var watchlistElement = $('.watchlist__list');
    var watchlistItemTemplate = $('#watchlist-item-template').content;
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    var createWatchlistItemElement = function (movie, index) {
        var watchlistItem = document.importNode(watchlistItemTemplate, true);
        watchlistItem.querySelector('.watchlist__title').textContent = movie.title;
        watchlistItem.querySelector('.watchlist__remove-button').dataset.index = index;
        return watchlistItem;
    };
    var createWatchlistFragment = function (watchlistedMovies) {
        var watchlistFragment = document.createDocumentFragment();
        watchlistedMovies.forEach(function (movie, index) {
            watchlistFragment.appendChild(createWatchlistItemElement(movie, index));
        });
        return watchlistFragment;
    };
    var renderWatchlist = function (watchlist) {
        watchlistElement.innerHTML = '';
        watchlistElement.appendChild(createWatchlistFragment(watchlist));
    };
    renderWatchlist(watchlist);
    elResult.addEventListener('click', function (evt) {
        if (evt.target.matches('.movie__watchlist')) {
            var movieId = parseInt(evt.target.dataset.id, 10);
            var movieToWatch = movies.find(function (movie) {
                return movie.id === movieId;
            });

            evt.target.disabled = true;
            console.log(evt.target);
            watchlist.push(movieToWatch);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            renderWatchlist(watchlist);
        }
    });
    watchlistElement.addEventListener('click', function (evt) {
        if (evt.target.matches('.watchlist__remove-button')) {
            watchlist.splice(evt.target.dataset.index, 1);
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            renderWatchlist(watchlist);
            if (window.search) {
                var sortMethod = $('#sort-by').value;
                if (sortMethod !== 'default')
                    window.search.sortByMethod(movies, sortMethod);
                else
                    movies = window.data.newMovies.slice();
                show.display(movies);
            }
            else {
                show.display(movies);
            }
        }
    });
    window.watchlist = {
        watchlist: watchlist
    }
})();
(function () {
    window.show.display(window.data.newMovies.slice(0, 45));
})();
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
var checkScroll = function(){
    var list = document.querySelector('.watchlist__list')
    if(window.scrollY >= 100){
        list.classList.add('list100')
    } else{
        list.classList.remove('list100')
    }
}
document.addEventListener('scroll', debounce(checkScroll, 200))