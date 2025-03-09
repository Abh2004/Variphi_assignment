import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAssignment, clearAssignmentError } from '../../store/slices/assignmentSlice';
import { fetchSubjects } from '../../store/slices/subjectSlice';
import { 
  Box, Typography, Paper, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, FormHelperText
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { MAX_FILE_SIZE } from '../../config';

const SubmitAssignment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.assignments);
  const { subjects, loading: subjectsLoading } = useSelector(state => state.subjects);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    submission_text: '',
    subject_id: '',
    file: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [fileName, setFileName] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Fetch subjects when component mounts
  useEffect(() => {
    dispatch(fetchSubjects());
    
    // Clear assignment errors when component unmounts
    return () => {
      dispatch(clearAssignmentError());
    };
  }, [dispatch]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({
          ...prev,
          file: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        }));
        setFileName('');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file
      }));
      setFileName(file.name);
      
      // Clear file error if exists
      if (formErrors.file) {
        setFormErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.subject_id) {
      errors.subject_id = 'Subject is required';
    }
    
    if (!formData.file && !formData.submission_text.trim()) {
      errors.file = 'Either file upload or text submission is required';
      errors.submission_text = 'Either file upload or text submission is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(createAssignment(formData))
        .unwrap()
        .then(() => {
          setSuccess(true);
          // Reset form
          setFormData({
            title: '',
            description: '',
            submission_text: '',
            subject_id: '',
            file: null
          });
          setFileName('');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/assignments');
          }, 2000);
        })
        .catch(() => {});
    }
  };
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Submit New Assignment
        </Typography>
      </Box>
      
      <Paper className="p-6" elevation={2}>
        {success && (
          <Alert severity="success" className="mb-4">
            Assignment submitted successfully!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Assignment Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
            disabled={loading || success}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={2}
            value={formData.description}
            onChange={handleChange}
            disabled={loading || success}
          />
          
          <FormControl 
            fullWidth 
            margin="normal" 
            error={!!formErrors.subject_id}
            disabled={loading || subjectsLoading || success}
          >
            <InputLabel id="subject-label">Subject</InputLabel>
            <Select
              labelId="subject-label"
              id="subject_id"
              name="subject_id"
              value={formData.subject_id}
              label="Subject"
              onChange={handleChange}
            >
              {subjects.map(subject => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.subject_id && (
              <FormHelperText>{formErrors.subject_id}</FormHelperText>
            )}
          </FormControl>
          
          <TextField
            margin="normal"
            fullWidth
            id="submission_text"
            label="Submission Text"
            name="submission_text"
            multiline
            rows={6}
            value={formData.submission_text}
            onChange={handleChange}
            error={!!formErrors.submission_text}
            helperText={formErrors.submission_text}
            disabled={loading || success}
            placeholder="Enter your assignment content here..."
          />
          
          <Box className="mt-4">
            <Typography variant="subtitle1" className="mb-2">
              Upload Assignment File (Optional)
            </Typography>
            
            <Box className="flex items-center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                disabled={loading || success}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />
              </Button>
              
              <Typography variant="body2" className="ml-2 text-gray-600">
                {fileName || 'No file chosen'}
              </Typography>
            </Box>
            
            {formErrors.file && (
              <Typography color="error" variant="caption" className="mt-1 block">
                {formErrors.file}
              </Typography>
            )}
            
            <Typography variant="caption" color="textSecondary" className="mt-1 block">
              Allowed file types: PDF, Word, PowerPoint, Excel, Text, Images (Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB)
            </Typography>
          </Box>
          
          <Box className="mt-6 flex justify-end">
            <Button
              variant="outlined"
              className="mr-2"
              onClick={() => navigate('/assignments')}
              disabled={loading || success}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Assignment'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubmitAssignment;