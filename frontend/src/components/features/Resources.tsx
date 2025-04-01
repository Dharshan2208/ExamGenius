import React, { useState, useCallback } from 'react';
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Link as LinkIcon, Article as ArticleIcon } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { ResourceSearchResponse } from '../../services/types';

const Resources: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResourceSearchResponse | null>(null);
  const { searchResources } = useApi();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null); // Clear previous results

    try {
      const searchResult = await searchResources(query);
       // Validate response structure if needed
      if (!searchResult || !searchResult.results) {
         throw new Error("Invalid search response structure from server.");
      }
      setResults(searchResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during search.';
      setError(errorMessage);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, searchResources]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Find Learning Resources
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search for topics (e.g., 'React Hooks', 'Python decorators')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={loading || !query.trim()} edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          sx={{ minWidth: 100, height: 56 }} // Match TextField height
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Display Tavily Answer if available */}
      {results?.answer && (
          <Alert severity="info" icon={<ArticleIcon />} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Summary:</Typography>
              {results.answer}
          </Alert>
      )}

      {results && (
        <Box>
          {results.results.length > 0 ? (
            <List>
              <Typography variant="subtitle1" gutterBottom>
                Found {results.results.length} result(s) for "{results.query}":
              </Typography>
              {results.results.map((item, index) => (
                <React.Fragment key={item.url + index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={<MuiLink href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</MuiLink>}
                      secondary={
                        <>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {item.content}
                          </Typography>
                          {/* Optionally display score: ` - Score: ${item.score?.toFixed(2)}` */}
                        </>
                      }
                    />
                     <IconButton href={item.url} target="_blank" rel="noopener noreferrer" edge="end" aria-label="link">
                         <LinkIcon />
                     </IconButton>
                  </ListItem>
                  {index < results.results.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            !error && loading === false && (
                <Typography sx={{mt: 2}}>No results found for "{results.query}". Try a different search term.</Typography>
            )
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Resources;