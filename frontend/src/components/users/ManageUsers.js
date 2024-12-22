import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchConfig } from '../../utils/AuthAPI';
import {
  fetchPreferences,
  savePreferences,
  getUsersDetails,
} from '../../utils/UserAPI';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ManageUsers = () => {
  const [fields, setFields] = useState([]); // List of {name, placeholder}
  const [selectedFields, setSelectedFields] = useState([]); // Fields to display (actual names)
  const [showForm, setShowForm] = useState(false); // Toggle collapsible form
  const [users, setUsers] = useState([]); // Placeholder for user data
  const [saving, setSaving] = useState(false); // Saving state
  const DEFAULT_FIELDS = ['username', 'email', 'flat_no', 'building_name']; // Default fallback fields
  // Inside ManageUsers component
  const navigate = useNavigate();
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const config = await fetchConfig();
        const savedPreferences = await fetchPreferences();
        const userData = await getUsersDetails();

        const fieldArray = Object.entries(config.fields).map(
          ([name, field]) => ({
            name,
            placeholder: field.form.placeholder || name,
          })
        );
        setFields(fieldArray);

        setSelectedFields(
          Array.isArray(savedPreferences) && savedPreferences.length > 0
            ? savedPreferences
            : DEFAULT_FIELDS
        );

        setUsers(userData);
      } catch (error) {
        console.error('Error loading initial data:', error.message);
      }
    };

    loadInitialData();
  }, []);

  const handleFieldToggle = (fieldName) => {
    setSelectedFields((prevSelected) =>
      prevSelected.includes(fieldName)
        ? prevSelected.filter((field) => field !== fieldName)
        : [...prevSelected, fieldName]
    );
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await savePreferences(selectedFields);
      alert('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    // Backend API to toggle status would go here
    console.log(`Toggling status for user ID ${userId} to ${!currentStatus}`);
  };

  const handleViewEdit = (userId) => {
    navigate(`/admin/view-profile/${userId}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowForm((prev) => !prev)}
          sx={{ mb: 1 }}
        >
          {showForm ? 'Hide Column Selection' : 'Show Column Selection'}
        </Button>
        <Collapse in={showForm}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Fields to Display:</Typography>
            {fields.map((field) => (
              <FormControlLabel
                key={field.name}
                control={
                  <Checkbox
                    checked={selectedFields.includes(field.name)}
                    onChange={() => handleFieldToggle(field.name)}
                  />
                }
                label={field.placeholder}
              />
            ))}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePreferences}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </Box>
          </Paper>
        </Collapse>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              {selectedFields.map((field) => (
                <TableCell key={field} align="center">
                  {fields.find((f) => f.name === field)?.placeholder || field}
                </TableCell>
              ))}
              <TableCell align="center">View/Edit</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                style={{
                  backgroundColor: user.status
                    ? 'rgba(144, 238, 144, 0.5)'
                    : 'rgba(144, 238, 144, 0.2)',
                }}
              >
                {selectedFields.map((field) => (
                  <TableCell key={field} align="center">
                    {user[field] || '-'}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton onClick={() => handleViewEdit(user.id)}>
                    {' '}
                    {/* Pass userId */}
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={user.status}
                    onChange={() => handleToggleStatus(user.id, user.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ManageUsers;
