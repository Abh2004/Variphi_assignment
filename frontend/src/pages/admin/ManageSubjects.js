import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../../store/slices/subjectSlice';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ManageSubjects = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector(state => state.subjects);
  
  // Local state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSubject, setCurrentSubject] = useState({ id: null, name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch subjects when component mounts
  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);
  
  // Handle opening dialog for create
  const handleOpenCreateDialog = () => {
    setIsEdit(false);
    setCurrentSubject({ id: null, name: '', description: '' });
    setFormErrors({});
    setDialogOpen(true);
  };
  
  // Handle opening dialog for edit
  const handleOpenEditDialog = (subject) => {
    setIsEdit(true);
    setCurrentSubject({ ...subject });
    setFormErrors({});
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubject(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error if exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!currentSubject.name.trim()) {
      errors.name = 'Subject name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submit (create or update)
  const handleSubmit = () => {
    if (validateForm()) {
      if (isEdit) {
        dispatch(updateSubject({
          id: currentSubject.id,
          subjectData: {
            name: currentSubject.name,
            description: currentSubject.description
          }
        }))
          .unwrap()
          .then(() => {
            handleCloseDialog();
          })
          .catch(() => {});
      } else {
        dispatch(createSubject({
          name: currentSubject.name,
          description: currentSubject.description
        }))
          .unwrap()
          .then(() => {
            handleCloseDialog();
          })
          .catch(() => {});
      }
    }
  };
  
  // Handle delete subject
  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      dispatch(deleteSubject(id));
    }
  };
  
  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Manage Subjects
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          className="bg-blue-700 hover:bg-blue-800"
        >
          Add Subject
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Paper elevation={2}>
        <TableContainer>
          {loading ? (
            <Box className="flex justify-center py-8">
              <CircularProgress />
            </Box>
          ) : subjects.length === 0 ? (
            <Box className="py-8 text-center">
              <Typography variant="body1" color="textSecondary">
                No subjects found. Click "Add Subject" to create one.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenEditDialog(subject)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
      
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEdit ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Subject Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentSubject.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={currentSubject.description || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            className="bg-blue-700 hover:bg-blue-800"
          >
            {loading ? <CircularProgress size={24} /> : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageSubjects;