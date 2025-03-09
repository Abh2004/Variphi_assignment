// src/components/comments/CommentSection.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Box, Typography, TextField, Button, Avatar, 
  Divider, CircularProgress, Paper
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { API_URL } from '../../config';

const CommentSection = ({ assignmentId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // Local state
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  
  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [assignmentId]);
  
  // Get auth config
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      withCredentials: true,
    };
  };
  
  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/comments/assignment/${assignmentId}`,
        getAuthConfig()
      );
      setComments(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle comment change
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };
  
  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/comments`,
        {
          text: newComment,
          assignment_id: assignmentId
        },
        getAuthConfig()
      );
      
      // Add new comment to the list
      setComments([...comments, response.data]);
      setNewComment('');
      setError('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Box>
      {loading ? (
        <Box className="flex justify-center py-4">
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error" className="py-2">
          {error}
        </Typography>
      ) : comments.length === 0 ? (
        <Typography className="text-center py-4 text-gray-500">
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box className="mb-4 max-h-80 overflow-y-auto">
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <Box className="flex py-3">
                <Avatar className="mt-1 mr-3 bg-blue-700">
                  {comment.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box className="flex-grow">
                  <Box className="flex justify-between">
                    <Typography variant="subtitle2" className="font-bold">
                      {comment.user.name} ({comment.user.role})
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="mt-1">
                    {comment.text}
                  </Typography>
                </Box>
              </Box>
              {index < comments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
      )}
      
      <Paper elevation={0} className="bg-gray-50 p-3">
        <Box className="flex">
          <TextField
            fullWidth
            placeholder="Write a comment..."
            variant="outlined"
            size="small"
            value={newComment}
            onChange={handleCommentChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            className="mr-2"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            startIcon={<SendIcon />}
            className="bg-blue-700 hover:bg-blue-800"
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CommentSection;