import { Box, Container, IconButton, Paper, Button, Typography, Select, FormControl,CardContent, CardActions, InputLabel, MenuItem, Slider, Autocomplete, Pagination, TextField, autocompleteClasses, Card, CardMedia, Modal } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useContext, useEffect } from "react";
import { FilterContext } from "./FiltersContext";
import matrixImg from './assets/matrix.jpg';

import { Routes, Route, Link, HashRouter } from "react-router-dom";
import FilmInfo from "./FilmInfo";


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const accountId = import.meta.env.VITE_TMDB_ACCOUNT_ID;


function ModalToken({ open, onClose, onSubmit }) {
    const [inputValue, setInputValue] = useState('');

    const handleConfirm = () => {
        if (inputValue.trim() !== '') {
            onSubmit(inputValue);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Введите email</Typography>
                <TextField 
                    fullWidth 
                    label="Email" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    sx={{ mt: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="contained" onClick={handleConfirm}>Подтвердить</Button>
                    <Button variant="outlined" onClick={() => setInputValue('')}>Очистить</Button>
                </Box>
            </Box>
        </Modal>
    );
}


function ModalLogin({ open, onClose, onSubmit }) {
    const [tokenValue, setTokenValue] = useState('');

    const handleOk = () => {
        if (tokenValue.trim() !== '') {
            onSubmit(tokenValue);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Введите токен</Typography>
                <TextField 
                    fullWidth 
                    label="Токен" 
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                    sx={{ mt: 2 }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="contained" onClick={handleOk}>Ок</Button>
                    <Button variant="outlined" onClick={onClose}>Отмена</Button>
                </Box>
            </Box>
        </Modal>
    );
}


function Header({ onLoginSuccess }) {
    const [openToken, setOpenToken] = useState(false);
    const [openLogin, setOpenLogin] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        const savedToken = localStorage.getItem('userToken');
    }, []);

    const handleIconClick = () => {
        const savedToken = localStorage.getItem('userToken');
        if (!savedToken) {
            setOpenToken(true);
        } else {
            alert("Вы уже авторизованы");
        }
    };

    const handleEmailSubmit = (userEmail) => {
        setEmail(userEmail);
        localStorage.setItem('userEmail', userEmail);
        setOpenToken(false);
        setOpenLogin(true);
    };

    const handleTokenSubmit = (userToken) => {
        localStorage.setItem('userToken', userToken);
        setOpenLogin(false);
        if (onLoginSuccess) {
            onLoginSuccess(userToken);
        }
    };

    return (
        <>
            <ModalToken 
                open={openToken} 
                onClose={() => setOpenToken(false)} 
                onSubmit={handleEmailSubmit} 
            />
            <ModalLogin 
                open={openLogin} 
                onClose={() => setOpenLogin(false)} 
                onSubmit={handleTokenSubmit}
            />
            <Box sx={{
                display: 'flex',
                bgcolor: '#2196F3',
                padding: '16px 24px',
                color: '#fff',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6">Фильмы</Typography>
                <IconButton onClick={handleIconClick}>
                    <AccountCircleIcon fontSize="medium" sx={{ color: 'white' }} />
                </IconButton>
            </Box>
        </>
    );

}

function yearText(value) {
  return `${value}`;
}


async function getApi(token) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=ru', options);
    const data = await response.json();
    return data.genres;
}


function Filters({ onCritChange, crit, years, onYearsChange, selectedGenres, onGenresChange, page, onPageChange, setSearchTitle, searchTitle }) {
	const [genreList, setGenresList] = useState([]);
	const token = useContext(FilterContext);
	
	useEffect(() => {
		if (token) {
			getApi(token).then(setGenresList);
		}
	}, [token]);

	const MIN_YEAR = 1960;
	const MAX_YEAR = 2024;

	const handleChangeYear = (event, newValue) => {
        onYearsChange(newValue);
    };

	return(
		<Box sx={{ maxWidth: '300px', maxHeight: '100vh' }}>
			<Paper sx={{ padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Box sx={{ 
					display: 'flex', 
					alignItems: 'center', 
					justifyContent: 'space-between' ,
					marginBottom: '16px'
				}}>
					<Typography>Фильтры</Typography>
				</Box>

				<Box sx={{
					marginBottom: '16px'
				}}>
					<FormControl fullWidth>
						<TextField
							label="Название фильма"
							variant="outlined"
							value={searchTitle}
							onChange={(e) => {setSearchTitle(e.target.value)}}
						/>
					</FormControl>
				</Box>

				<Box sx={{ marginBottom: '16px' }}>
					<FormControl fullWidth>
						<InputLabel id="demo-simple-select-label">Сортировать по</InputLabel>
						<Select
							labelId="demo-simple-select-label"
							id="demo-simple-select"
							value={crit}
							label="Сортировать по"
							onChange={(e) => onCritChange(e.target.value)}
						>
						<MenuItem value='popular'>Популярности</MenuItem>
						<MenuItem value='rating'>Рейтингу</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<Box sx={{marginBottom: '16px'}}>
					<Typography variant="h6" component="p" gutterBottom sx={{ color: '#333' }}>
						Год релиза:
					</Typography>
					<Box sx={{ px: 2, pt: 5, pb: 1 }}>
						<Slider
							value={years}
							onChange={handleChangeYear}
							valueLabelDisplay="on"
							getAriaValueText={yearText}
							min={1960}
							max={2024}
							step={1}
							marks={true}
							color="primary"
						/>
					</Box>
				</Box>

				<Box sx={{ marginBottom: '20px' }}>
                    <Autocomplete
                        multiple
                        options={genreList}
                        getOptionLabel={(option) => option.name}
                        value={selectedGenres}
                        onChange={(event, newValue) => {
                            onGenresChange(newValue);
                        }}
                        disableCloseOnSelect
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Жанры" 
                                placeholder="Выберите жанр" 
                            />
                        )}
                    />
                </Box>

				<Box sx={{ 
					marginTop: 'auto',
					display: 'flex', 
					justifyContent: 'center',
				}}>
					<Pagination 
						count={5} 
						color="primary" 
						page={page}
						onChange={(event, value) => onPageChange(value)}
					/>
				</Box>
			</Paper>
		</Box>
	);
}


async function addMovieToFavorite(movieId, token, isFavorite) {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            media_type: 'movie',
            media_id: Number(movieId),
            favorite: !isFavorite
        })
    };

    try {
        const response = await fetch(`https://api.themoviedb.org/3/account/${accountId}/favorite`, options);
        const data = await response.json();
		const fav = await getFavoriteMovies(token);
		return data;
    } catch (err) {
        console.error(err);
    }
}


async function getFavoriteMovies(token) {
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',	
			Authorization: `Bearer ${token}`
		}
	};
	const response = await fetch(`https://api.themoviedb.org/3/account/${accountId}/favorite/movies?language=ru`, options);
	const data = await response.json();
	return data.results;
}


function MovieCard({ id, poster_path, title, rating, token }) {
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
        const checkFavorite = async () => {
            if (token) {
                const favorites = await getFavoriteMovies(token);
                const isFav = favorites.some(movie => movie.id === id);
                setIsFavorite(isFav);
            }
        };
        checkFavorite();
    }, [id, token]);

	const handleFavoriteClick = async (e) => {
		e.stopPropagation();
		e.preventDefault();

		if (!token) {
			alert("Пожалуйста, авторизуйтесь");
			return;
		}

		const previousFavouriteStatus = isFavorite;

		setIsFavorite(!previousFavouriteStatus);

		try {
			const data = await addMovieToFavorite(id, token, previousFavouriteStatus);

			if (data?.status_code && data.status_code !== 1 && data.status_code !== 12 && data.status_code !== 13) {
				throw new Error("Ошибка API");
			}
		}
		catch (error) {			
			setIsFavorite(previousFavouriteStatus);

			alert("Не удалось сохранить изменения. Попробуйте позже.");
		}
	};


	return(
		<Card sx={{ width: 330, minHeight: 324, marginBottom: '16px', textDecoration: 'none'}} component={Link} to={`/movie/${id}`} state={{ title, poster_path, rating }}>
			<CardMedia
				component="img"
				alt="matrix"
				height="240"
				image={poster_path}
			/>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<CardContent>
					<Typography gutterBottom variant="h5" component="div">
						{title}
					</Typography>
					<Typography gutterBottom variant="h6" component="div">
						Рейтинг: {rating}
					</Typography>
				</CardContent>
				<CardActions>
					<IconButton onClick={handleFavoriteClick}>
						{isFavorite ? <StarIcon color="primary" /> : <StarBorderIcon sx={{color: 'black'}} />}
					</IconButton>
				</CardActions>
			</Box>
		</Card>
	);
}




async function getFilmList({ 
    token, 
    page = 1, 
    sort_by = 'popularity.desc',
    year_gte = 1960, 
    year_lte = 2024, 
    genres = [],
	title = ''
}) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };

	const baseParams = `language=ru-RU&page=${page}`;

	let url = '';
    
    const genreParams = (genres && genres.length > 0) 
        ? `&with_genres=${genres.join(',')}` 
        : '';
	const dateParams = `&primary_release_date.gte=${year_gte}-01-01&primary_release_date.lte=${year_lte}-12-31`;
    const sortParams = `&sort_by=${sort_by}`;
	
    
	if(title){
		url = `https://api.themoviedb.org/3/search/movie?${baseParams}&query=${encodeURIComponent(title)}`;
	} else{
        url = `https://api.themoviedb.org/3/discover/movie?${baseParams}${sortParams}${dateParams}${genreParams}`;
	}

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();

		let results = data.results || [];

		if (title && results.length > 0) {
            results = results.filter(film => {
                const releaseYear = film.release_date ? parseInt(film.release_date.split('-')[0]) : 0;
                const matchesYear = releaseYear >= year_gte && releaseYear <= year_lte;
                const matchesGenre = genres.length === 0 || genres.every(id => film.genre_ids?.includes(id));
                return matchesYear && matchesGenre;
            });
        }

        return results.map((film) => ({
            id: film.id,
            title: film.title,
            poster: film.poster_path 
                ? `https://image.tmdb.org/t/p/w500${film.poster_path}` 	
                : 'https://via.placeholder.com/500x750?text=No+Poster',
            rating: film.vote_average
        }));
    } catch (error) {
        console.error("Ошибка в getFilmList:", error);
        return [];
    }
}


function App() {
	const [crit, setCrit] = useState('');
	const [films, setFilms] = useState([]);
	const token = useContext(FilterContext);
	const [years, setYears] = useState([1987, 2001]);
	const [genreList, setGenresList] = useState([]);
	const MIN_YEAR = 1960;
	const MAX_YEAR = 2024;
	const [page, setPage] = useState(1);
	const [selectedGenres, setSelectedGenres] = useState([]);
	const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
	const [searchTitle, setSearchTitle] = useState('');

	const handleLoginSuccess = (token) => {
        setUserToken(token);
    };


	function handleChangeCrit(new_value)
	{
		setCrit(new_value);
	};

	function onPageChange(newPage) {
		setPage(newPage);
	}

	useEffect(() => {
		if (token) { 
			const genreIds = selectedGenres.map(g => g.id); 
			const sortValue = crit === 'rating' ? 'vote_average.desc' : 'popularity.desc';
			
			getFilmList({ 
				token: token,
				sort_by: sortValue,
				year_gte: years[0], 
				year_lte: years[1], 
				genres: genreIds,
				page: page,
				title: searchTitle
			}).then(setFilms);
		}
	}, [token, page, crit, years, selectedGenres, searchTitle]);



	return(
		<HashRouter>
			<CssBaseline />
			<Container maxWidth={false} disableGutters sx={{ height: '100vh'}}>
				<Routes>
					<Route path="/" element={
						<>
							<Header onLoginSuccess={handleLoginSuccess}/>
							<Box sx={{
							padding: '24px',
							display: "flex",
							gap: '10px'
						}}>
							<Filters 
								onCritChange={handleChangeCrit} 
								crit={crit}
								years={years}
								onYearsChange={setYears}
								selectedGenres={selectedGenres}
								onGenresChange={setSelectedGenres}
								page={page}
								onPageChange={setPage}
								setSearchTitle={setSearchTitle}
								searchTitle={searchTitle}
							/>
							<Box sx={{
								display: 'flex', 
								maxWidth: 1050, 
								flexWrap: 'wrap',
								gap: '16px', 
								margin: '0 auto'
							}}>
								{userToken ? (
									films.map((film) => (
										<MovieCard 
											key={film.id}
											id={film.id}
											title={film.title} 
											poster_path={film.poster}
											rating={film.rating}
											token={token}
										/>
									))
								) : (
									<Typography variant="h5" sx={{ mt: 10 }}>
										Пожалуйста, авторизуйтесь (нажмите на иконку профиля), чтобы увидеть список фильмов.
									</Typography>
								)}
							</Box>
						</Box>
						</>
					}/>
					<Route path="/movie/:id" element={<FilmInfo />}/>
				</Routes>
			</Container>
		</HashRouter>
	);
}

export default App
