import React, { useState, useCallback } from 'react';
import {
    Button, CircularProgress, Typography, Box, Alert, Paper, List,
    ListItemText,
    Collapse,
    Tooltip,
    ListItemButton,
    Card, CardContent, CardActions
} from '@mui/material';
import {
    UploadFile as UploadFileIcon, ExpandLess, ExpandMore, Info as InfoIcon,
    Link as LinkIcon, Article as ArticleIcon, OndemandVideo as VideoIcon
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { Topic, TopicResourceResponse, RecommendedResource } from '../../services/types';
import { useAnalysis } from '../../context/AnalysisContext';

// Helper component to display recommended resources
const RecommendedResourceItem: React.FC<{ resource: RecommendedResource }> = ({ resource }) => (
    <Card variant="outlined" sx={{ mb: 1 }}>
        <CardContent sx={{ pb: 1 }}>
            <Typography variant="subtitle2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {resource.type === 'video' ? <VideoIcon fontSize="small" color="action" /> : <ArticleIcon fontSize="small" color="action" />}
                {resource.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {resource.explanation}
            </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
            <Button
                size="small"
                href={resource.url}
                target="_blank" // Open in new tab
                rel="noopener noreferrer" // Security best practice
                startIcon={<LinkIcon />}
            >
                Go to Resource
            </Button>
        </CardActions>
    </Card>
);

// Helper component to display topics recursively
const TopicItem: React.FC<{ topic: Topic; level?: number }> = ({ topic, level = 0 }) => {
    const [open, setOpen] = useState(level < 1); // Initially open top-level items
    const [loadingResources, setLoadingResources] = useState<boolean>(false);
    const [resourceError, setResourceError] = useState<string | null>(null);
    const [resources, setResources] = useState<TopicResourceResponse | null>(null);
    const { getCuratedResourcesForTopic } = useApi();

    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
    const isLeafTopic = !hasSubtopics; // Treat items without subtopics as potential fetch triggers

    const handleClick = useCallback(async () => {
        if (isLeafTopic) {
            // Fetch resources for this topic if not already fetched or loading
            if (!resources && !loadingResources) {
                setLoadingResources(true);
                setResourceError(null);
                setResources(null);
                try {
                    console.log(`Fetching resources for: ${topic.name}`);
                    const result = await getCuratedResourcesForTopic(topic.name);
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    setResources(result);
                    console.log(`Resources fetched for ${topic.name}:`, result);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resources.';
                    console.error(`Error fetching resources for ${topic.name}:`, err);
                    setResourceError(errorMessage);
                } finally {
                    setLoadingResources(false);
                }
            }
        } else {
            // Toggle subtopic visibility
            setOpen(!open);
        }
    }, [isLeafTopic, topic.name, resources, loadingResources, getCuratedResourcesForTopic]);

    return (
        <>
            <ListItemButton
                sx={{ pl: 2 + level * 2 }} // Indentation based on level
                onClick={handleClick}
                dense // Make items a bit smaller
            >
                <ListItemText
                    primary={topic.name}
                    secondary={
                        <Typography component="span" variant="body2" color="text.secondary">
                            {`Importance: ${topic.importance}`}
                            {topic.estimated_hours != null ? ` | Est. Hours: ${topic.estimated_hours.toFixed(1)}` : ''}
                        </Typography>
                    }
                />
                {/* Show expand icon for subtopics, show info icon for leaf topics to indicate click action */}
                {hasSubtopics ? (
                    open ? <ExpandLess /> : <ExpandMore />
                ) : (
                    <Tooltip title="Click to find learning resources">
                        <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                    </Tooltip>
                )}
            </ListItemButton>

            {/* Display fetched resources below the clicked item */}
            {isLeafTopic && (loadingResources || resourceError || resources) && (
                <Box sx={{ pl: 4 + level * 2, pr: 2, pb: 1, pt: 0.5, borderLeft: '1px solid', borderColor: 'divider', ml: 2 + level * 2 - 0.1 }}>
                    {loadingResources && <CircularProgress size={20} sx={{ display: 'block', mx: 'auto', my: 1 }} />}
                    {resourceError && <Alert severity="warning" sx={{ my: 1 }}>{resourceError}</Alert>}
                    {resources && (
                        <Box>
                            {(resources.videos.length > 0 || resources.articles.length > 0) ? (
                                <Box sx={{ mt: 1 }}>
                                    {resources.videos.length > 0 && (
                                        <Box mb={1.5}>
                                            <Typography variant="overline" display="block" gutterBottom>Recommended Videos:</Typography>
                                            {resources.videos.map((res: RecommendedResource) => <RecommendedResourceItem key={res.url} resource={res} />)}
                                        </Box>
                                    )}
                                    {resources.articles.length > 0 && (
                                        <Box>
                                             <Typography variant="overline" display="block" gutterBottom>Recommended Articles:</Typography>
                                            {resources.articles.map((res: RecommendedResource) => <RecommendedResourceItem key={res.url} resource={res} />)}
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    No specific resources found for this topic.
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}

            {/* Recursive display of subtopics */}
            {hasSubtopics && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {topic.subtopics.map((subtopic, index) => (
                            <TopicItem key={`${subtopic.name}-${index}-${level}`} topic={subtopic} level={level + 1} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const SyllabusUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { uploadSyllabus } = useApi();
    const { analysisResult, setAnalysisResult } = useAnalysis();

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setError(null); // Clear previous errors
            setAnalysisResult(null); // Clear context analysis on new file select
        }
    }, [setAnalysisResult]);

    const handleUpload = useCallback(async () => {
        if (!file) {
            setError('Please select a syllabus file to upload.');
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisResult(null); // Clear context analysis before upload

        try {
            const result = await uploadSyllabus(file);
            // Validate response structure if needed
            if (!result || !result.topics) {
                throw new Error("Invalid analysis response structure from server.");
            }
            setAnalysisResult(result); // Set analysis result in context
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during upload.';
            setError(errorMessage);
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
        }
    }, [file, uploadSyllabus, setAnalysisResult]);

    return (
        <Paper elevation={2} sx={{ p: 3, maxWidth: 'md', mx: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Analyze Your Syllabus
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={loading}
                >
                    Select Syllabus File
                    <input
                        type="file"
                        hidden
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                    />
                </Button>
                {file && (
                    <Typography variant="body2" color="text.secondary">
                        Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: (analysisResult || error) ? 2 : 0 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    sx={{ minWidth: 150 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload and Analyze'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {analysisResult && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Analysis Results
                    </Typography>
                    {analysisResult.total_study_hours != null && (
                        <Typography variant="subtitle1" gutterBottom>
                            Estimated Total Study Hours: {analysisResult.total_study_hours.toFixed(1)}
                        </Typography>
                    )}
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Topics:</Typography>
                    {analysisResult.topics.length > 0 ? (
                        <List component={Paper} variant="outlined" sx={{ maxHeight: '60vh', overflow: 'auto', bgcolor: 'background.default' }}>
                            {analysisResult.topics.map((topic, index) => (
                                // Ensure a unique key using topic name and index
                                <TopicItem key={`${topic.name}-${index}`} topic={topic} />
                            ))}
                        </List>
                    ) : (
                        <Typography>No topics were extracted from the syllabus.</Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default SyllabusUpload;