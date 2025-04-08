import React, { useState } from 'react';
import {
    Button, CircularProgress, Typography, Box, Alert, Paper, List,
    ListItemText, Collapse, ListItemButton, Card, CardContent,
    CardActions, Grid, Divider, Snackbar
} from '@mui/material';
import {
    UploadFile as UploadFileIcon, ExpandLess, ExpandMore,
    Article as ArticleIcon, CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { Topic, TopicResourceResponse, RecommendedResource, SyllabusAnalysisResponse } from '../../services/types';

// Add type declaration for @mui/icons-material
declare module '@mui/icons-material';

// Helper component to display recommended resources
const RecommendedResourceItem: React.FC<{ resource: RecommendedResource }> = ({ resource }) => (
    <Card variant="outlined" sx={{ 
        mb: 1, 
        boxShadow: 'none', 
        border: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderColor: 'rgba(25, 118, 210, 0.3)',
        }
    }}>
        <CardContent sx={{ pb: 1, pt: 1.5 }}>
            <Typography variant="subtitle2" component="div" fontWeight={500}>
                {resource.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
                {resource.explanation}
            </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0, justifyContent: 'flex-end', pb: 1 }}>
            <Button
                size="small"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                    textTransform: 'none', 
                    fontWeight: 400,
                    fontSize: 13,
                    color: '#1976d2',
                }}
            >
                View Resource
            </Button>
        </CardActions>
    </Card>
);

// Helper component to display topics recursively
const TopicItem: React.FC<{ topic: Topic; level?: number }> = ({ topic, level = 0 }) => {
    const [open, setOpen] = useState(level < 1);
    const [loadingResources, setLoadingResources] = useState<boolean>(false);
    const [resourceError, setResourceError] = useState<string | null>(null);
    const [resources, setResources] = useState<TopicResourceResponse | null>(null);
    const { getCuratedResourcesForTopic } = useApi();

    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
    const isLeafTopic = !hasSubtopics;

    const handleClick = async () => {
        if (isLeafTopic) {
            if (!resources && !loadingResources) {
                setLoadingResources(true);
                setResourceError(null);
                setResources(null);
                try {
                    const result = await getCuratedResourcesForTopic(topic.name);
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    setResources(result);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resources.';
                    setResourceError(errorMessage);
                } finally {
                    setLoadingResources(false);
                }
            }
        } else {
            setOpen(!open);
        }
    };

    const getImportanceStyle = (importance: string) => {
        switch (importance.toLowerCase()) {
            case 'high': return { color: '#7c3535', fontWeight: 500 };
            case 'medium': return { color: '#6b5c2c', fontWeight: 500 };
            case 'low': return { color: '#32633d', fontWeight: 500 };
            default: return { color: 'text.secondary', fontWeight: 400 };
        }
    };

    return (
        <>
            <ListItemButton
                sx={{ 
                    pl: 2 + level * 2,
                    borderLeft: level > 0 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                    ml: level > 0 ? 1 : 0,
                    borderRadius: 1,
                    mb: 0.75,
                    transition: 'all 0.2s',
                    backgroundColor: level === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                }}
                onClick={handleClick}
                dense
            >
                <ListItemText
                    disableTypography
                    primary={
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            width: '100%'
                        }}>
                            <Typography 
                                variant={level === 0 ? "subtitle1" : "body1"} 
                                fontWeight={level === 0 ? 600 : 400} 
                                sx={{ 
                                    color: level === 0 ? 'text.primary' : 'inherit',
                                    fontSize: level === 0 ? 16 : 15,
                                }}
                            >
                                {topic.name}
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                alignItems: 'center',
                                minWidth: '120px',
                                justifyContent: 'flex-end'
                            }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        ...getImportanceStyle(topic.importance),
                                        fontSize: 13,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {topic.importance}
                                </Typography>
                                {topic.estimated_hours != null && (
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            fontSize: 13,
                                        }}
                                    >
                                        {topic.estimated_hours.toFixed(1)} hrs
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    }
                />
                {hasSubtopics && (
                    <Box sx={{ ml: 1 }}>
                        {open ? 
                            <ExpandLess sx={{ color: 'text.secondary', fontSize: 18 }} /> : 
                            <ExpandMore sx={{ color: 'text.secondary', fontSize: 18 }} />
                        }
                    </Box>
                )}
            </ListItemButton>
            {hasSubtopics && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {topic.subtopics.map((subtopic, index) => (
                            <TopicItem key={index} topic={subtopic} level={level + 1} />
                        ))}
                    </List>
                </Collapse>
            )}
            {isLeafTopic && open && (
                <Box sx={{ 
                    pl: 4 + level * 2, 
                    pr: 2, 
                    pb: 2,
                    ml: level > 0 ? 1 : 0,
                    mt: 1,
                    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
                    borderBottomLeftRadius: 4,
                }}>
                    {loadingResources && <CircularProgress size={16} sx={{ color: 'text.secondary', ml: 1 }} />}
                    {resourceError && (
                        <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>
                            {resourceError}
                        </Alert>
                    )}
                    {resources && (
                        <Box sx={{ mt: 1 }}>
                            {resources.videos.length > 0 && (
                                <>
                                    <Typography 
                                        variant="subtitle2" 
                                        sx={{ mt: 1, mb: 1, fontWeight: 500, color: '#455a64' }}
                                    >
                                        Recommended Videos
                                    </Typography>
                                    {resources.videos.map((video, index) => (
                                        <RecommendedResourceItem key={index} resource={video} />
                                    ))}
                                </>
                            )}
                            {resources.articles.length > 0 && (
                                <>
                                    <Typography 
                                        variant="subtitle2" 
                                        sx={{ mt: 1, mb: 1, fontWeight: 500, color: '#455a64' }}
                                    >
                                        Recommended Articles
                                    </Typography>
                                    {resources.articles.map((article, index) => (
                                        <RecommendedResourceItem key={index} resource={article} />
                                    ))}
                                </>
                            )}
                            {resources.videos.length === 0 && resources.articles.length === 0 && (
                                <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                                    No specific resources found for this topic.
                                </Alert>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
};

// Main component
const SyllabusUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<SyllabusAnalysisResponse | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { uploadSyllabus } = useApi();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            setError(null);
            setSnackbarMessage(`File "${selectedFile.name}" selected successfully`);
            setSnackbarOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);
        setAnalysis(null);

        try {
            console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
            
            // Call API with the file directly - don't create a separate FormData
            // as the uploadSyllabus function already does that
            const response = await uploadSyllabus(file);
            console.log('Upload successful, response:', response);
            setAnalysis(response);
            setSnackbarMessage('Syllabus analysis completed successfully!');
            setSnackbarOpen(true);
        } catch (err) {
            console.error('Upload failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload and analyze syllabus';
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box>
            <Paper 
                elevation={4} 
                sx={{ 
                    p: 4, 
                    mb: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <Typography variant="h4" fontWeight="700" gutterBottom sx={{ color: '#2c3e50' }}>
                    Upload Syllabus
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '600px' }}>
                    Upload your syllabus file (.pdf, .docx, .txt) to get an AI-powered analysis and study plan tailored to your course material.
                </Typography>
                
                <Box 
                    sx={{ 
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        gap: 2.5, 
                        alignItems: {xs: 'stretch', sm: 'center'}, 
                        mb: 3,
                        mt: 4
                    }}
                >
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{ 
                            borderRadius: 2.5,
                            py: 1.5,
                            px: 3,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                            }
                        }}
                    >
                        Select File
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                        />
                    </Button>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        sx={{ 
                            borderRadius: 2.5,
                            py: 1.5,
                            px: 3,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            background: !file || uploading ? undefined : 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: !file || uploading ? undefined : 'translateY(-2px)',
                                boxShadow: !file || uploading ? undefined : '0 6px 12px rgba(0,0,0,0.15)',
                            }
                        }}
                    >
                        {uploading ? 'Analyzing...' : 'Upload & Analyze'}
                    </Button>
                </Box>
                
                {file && (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            display: 'flex',
                            flexDirection: {xs: 'column', sm: 'row'}, 
                            p: 2, 
                            gap: 1,
                            alignItems: 'center', 
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            maxWidth: '600px',
                            borderColor: 'primary.light',
                            mb: 2
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: 'primary.main', 
                            mr: 1.5,
                            '& svg': { 
                                fontSize: 40 
                            }
                        }}>
                            {file.type.includes('pdf') ? 
                                <ArticleIcon fontSize="large" color="primary" /> : 
                                <ArticleIcon fontSize="large" color="primary" />
                            }
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="500">
                                {file.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {(file.size / 1024).toFixed(1)} KB · {file.type || 'Unknown type'}
                            </Typography>
                        </Box>
                    </Paper>
                )}
                
                {error && (
                    <Alert 
                        severity="error" 
                        variant="filled"
                        sx={{ 
                            mt: 2, 
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                alignItems: 'center'
                            }
                        }}
                    >
                        <Box>
                            <Typography fontWeight="bold">Upload failed</Typography>
                            <Typography variant="body2">{error}</Typography>
                        </Box>
                    </Alert>
                )}
            </Paper>

            {analysis && (
                <Paper 
                    elevation={4} 
                    sx={{ 
                        p: { xs: 2, sm: 3, md: 4 }, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            flexWrap: 'wrap',
                            mb: 1.5 
                        }}>
                            <Typography 
                                variant="h4" 
                                fontWeight={700} 
                                sx={{ 
                                    color: '#2c3e50',
                                    fontSize: { xs: '1.75rem', md: '2.125rem' } 
                                }}
                            >
                                Syllabus Analysis
                            </Typography>
                            {analysis.total_study_hours && (
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: { xs: '1rem', md: '1.125rem' },
                                        backgroundColor: 'rgba(0,0,0,0.04)',
                                        px: 2,
                                        py: 0.75,
                                        borderRadius: 2
                                    }}
                                >
                                    Total Study Time: {analysis.total_study_hours.toFixed(1)} hours
                                </Typography>
                            )}
                        </Box>
                        <Divider sx={{ 
                            mb: 4,
                            borderColor: 'rgba(0,0,0,0.1)',
                            borderBottomWidth: 2
                        }} />
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: { xs: 2, md: 2.5 }, 
                                            borderRadius: 2, 
                                            height: '100%',
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            borderColor: 'rgba(0,0,0,0.08)',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                        }}
                                    >
                                        <Typography 
                                            variant="h5" 
                                            fontWeight={600} 
                                            gutterBottom
                                            sx={{ 
                                                color: '#2c3e50',
                                                mb: 2,
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                pb: 1,
                                                fontSize: { xs: '1.25rem', md: '1.5rem' }
                                            }}
                                        >
                                            Course Topics
                                        </Typography>
                                        <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
                                            <List sx={{ pt: 0 }}>
                                                {analysis.topics.map((topic, index) => (
                                                    <TopicItem key={index} topic={topic} />
                                                ))}
                                            </List>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: { xs: 2, md: 2.5 }, 
                                            borderRadius: 2, 
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            borderColor: 'rgba(0,0,0,0.08)',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                        }}
                                    >
                                        <Typography 
                                            variant="h5" 
                                            fontWeight={600} 
                                            gutterBottom
                                            sx={{ 
                                                color: '#2c3e50',
                                                mb: 2,
                                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                pb: 1,
                                                fontSize: { xs: '1.25rem', md: '1.5rem' }
                                            }}
                                        >
                                            Priority Topics
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                mb: 2.5,
                                                color: '#455a64',
                                                fontWeight: 500,
                                                backgroundColor: 'rgba(66, 165, 245, 0.08)',
                                                px: 1.5,
                                                py: 1,
                                                borderRadius: 1,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Focus on these high-impact topics first
                                        </Typography>
                                        <List sx={{ pt: 0 }}>
                                            {analysis.priority_topics && analysis.priority_topics.length > 0 ? (
                                                analysis.priority_topics.map((topic, index) => (
                                                    <TopicItem key={index} topic={topic} />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                                                    No priority topics identified
                                                </Typography>
                                            )}
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default SyllabusUpload;