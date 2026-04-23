import { Box, Button, Card, CardMedia, Container, CssBaseline, IconButton, Typography } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FilterContext } from "./FiltersContext";


function HeaderInfo({ title }){
	return(
		<Box sx={{
			display: 'flex',
			bgcolor: '#2196F3',
			padding: '16px 24px',
			color: '#fff',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<Typography variant="h6">Фильмы - {title}</Typography>
			<IconButton>
				<AccountCircleIcon fontSize="medium" sx={{color: 'white'}}/>
			</IconButton>
		</Box>
	);
}


async function getMovieDetails(id, token) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=ru`, options);
    const data = await response.json();
    return data;
}


async function getMovieCredits(id, token){
    const url = `https://api.themoviedb.org/3/movie/${id}/credits?language=ru`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}


export default function FilmInfo() {
    const { id } = useParams();
    const location = useLocation();
    const movieData = location.state;
    const [details, setDetails] = useState(null);
    const [credits, setCredits] = useState(null);
    const token = useContext(FilterContext);
    const navigate = useNavigate();


    useEffect(() => {
        if (token) {
            getMovieDetails(id, token).then(setDetails);
            getMovieCredits(id, token).then(setCredits);
        }
    }, [id, token]);

    if (!details) {
        return <Typography variant="h6" sx={{ padding: '24px' }}>Загрузка...</Typography>;
    }
    console.log(details);
    console.log(credits);

    return(
        <>
            <HeaderInfo title={movieData.title} />
            <Box sx={{
                display: 'flex'
            }}>
                <img src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`} alt={movieData.title} style={{ width: '300px', margin: '24px', maxHeight: '400px' }} />
                <Box sx={{ padding: '24px' }}>
                    <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Typography variant="h4" gutterBottom>{movieData.title} ({details.release_date?.split('-')[0]})</Typography>
                        <Button variant='text' startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ marginBottom: '16px' }}>Назад</Button>  
                    </Box>
                    <Typography variant="h6" gutterBottom>Рейтинг: {movieData.rating}</Typography>
                    <Typography variant="body1" gutterBottom>{details.overview}</Typography>
                    <Typography><b>В ролях:</b> {credits?.cast?.map(c => c.name).join(', ') || 'нет данных'}</Typography>

                    <Typography variant="h4" gutterBottom> Детали </Typography>
                    <Typography variant="body1" gutterBottom>Жанры: {details.genres.map(g => g.name).join(', ')}</Typography>
                    <Typography variant="body1" gutterBottom>Продолжительность: {details.runtime} мин</Typography>
                    <Typography variant="body1" gutterBottom>Дата релиза: {details.release_date}</Typography>
                    <Typography variant="body1" gutterBottom>Статус: {details.status}</Typography>
                    <Typography variant="body1" gutterBottom>Бюджет: {details.budget ? `${details.budget} $` : 'нет данных'}</Typography>
                    <Typography variant="body1" gutterBottom>Сборы: {details.revenue ? `${details.revenue} $` : 'нет данных'}</Typography>
                    <Typography variant="body1" gutterBottom>Режиссер: {details.credits?.crew.find(c => c.job === 'Director')?.name || details.origin_country}</Typography>
                </Box>
            </Box>
        </>
    );
}