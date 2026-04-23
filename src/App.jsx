import { Box, Container, IconButton, Paper, Button, Typography, Select, FormControl,CardContent, CardActions, InputLabel, MenuItem, Slider, Autocomplete, Pagination, TextField, autocompleteClasses, Card, CardMedia } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useContext, useEffect } from "react";
import { FilterContext } from "./FiltersContext";
import matrixImg from './assets/matrix.jpg';

import { BrowserRouter, Routes, Route, Link, HashRouter } from "react-router-dom";
import FilmInfo from "./FilmInfo";

function Header(){
	return(
		<Box sx={{
			display: 'flex',
			bgcolor: '#2196F3',
			padding: '16px 24px',
			color: '#fff',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<Typography variant="h6">Фильмы</Typography>
			<IconButton>
				<AccountCircleIcon fontSize="medium" sx={{color: 'white'}}/>
			</IconButton>
		</Box>
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


function Filters({ onCritChange, crit, years, onYearsChange, selectedGenres, onGenresChange, page, onPageChange }) {
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
					<IconButton>
						<CloseIcon fontSize="small"/>
					</IconButton>
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


function MovieCard({ id, poster_path, title, rating }) {
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
					<IconButton>
						<StarBorderIcon sx={{color: 'black'}} />
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
    genres = []
}) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    
    const genreParams = (genres && genres.length > 0) 
        ? `&with_genres=${genres.join(',')}` 
        : '';
    
    const url = `https://api.themoviedb.org/3/discover/movie?language=ru-RU` +
                `&page=${page}` +
                `&sort_by=${sort_by}` +
                `&primary_release_date.gte=${year_gte}-01-01` +
                `&primary_release_date.lte=${year_lte}-12-31` +
                genreParams;

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();

        return (data.results || []).map((film) => ({
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
				token, 
				sort_by: sortValue,
				year_gte: years[0], 
				year_lte: years[1], 
				genres: genreIds,
				page: page
			}).then(setFilms);
		}
	}, [token, page, crit, years, selectedGenres]);

	console.log(films);


	return(
		<HashRouter>
			<CssBaseline />
			<Container maxWidth={false} disableGutters sx={{ height: '100vh'}}>
				<Routes>
					<Route path="/" element={
						<>
							<Header />
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
							/>
							<Box sx={{
								display: 'flex', 
								maxWidth: 1050, 
								flexWrap: 'wrap',
								gap: '16px', 
								margin: '0 auto'
							}}>
								{films.map((film) => (
									<MovieCard 
										key={film.id}
										id={film.id}
										title={film.title} 
										poster_path={film.poster}
										rating={film.rating}
									/>
								))}
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
