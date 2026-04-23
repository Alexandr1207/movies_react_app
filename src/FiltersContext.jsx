import { createContext } from "react";

const API_KEY = import.meta.env.VITE_TMDB_TOKEN;
export const FilterContext = createContext(API_KEY);