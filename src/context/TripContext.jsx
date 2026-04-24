import { createContext, useContext, useReducer } from 'react';

const TripContext = createContext(null);

const initialState = {
  searchParams: { from: '', to: '', date: '', type: '' },
  results: [],
  loading: false,
  error: null,
  filters: { type: '', maxPrice: '', sortBy: 'time' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_PARAMS':
      return { ...state, searchParams: { ...state.searchParams, ...action.payload } };
    case 'SET_RESULTS':
      return { ...state, results: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  function setSearchParams(params) {
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: params });
  }

  function setResults(results) {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }

  function setLoading(loading) {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }

  function setError(error) {
    dispatch({ type: 'SET_ERROR', payload: error });
  }

  function setFilters(filters) {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }

  const filteredResults = state.results
    .filter((t) => {
      if (state.filters.type && t.type !== state.filters.type) return false;
      if (state.filters.maxPrice && t.price > Number(state.filters.maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (state.filters.sortBy === 'price') return a.price - b.price;
      return a.departureTime.localeCompare(b.departureTime);
    });

  return (
    <TripContext.Provider
      value={{ ...state, filteredResults, setSearchParams, setResults, setLoading, setError, setFilters }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrips must be used within TripProvider');
  return ctx;
}
