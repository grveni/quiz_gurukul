import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const commonLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: `/${role}` },
    { text: 'Quizzes', icon: <QuizIcon />, path: `/${role}/quizzes` },
  ];

  const adminLinks = [
    { text: 'Manage Users', icon: <DashboardIcon />, path: '/admin/users' },
    {
      text: 'Manage Quizzes',
      icon: <QuizIcon />,
      path: '/admin/manage-quizzes',
    },
    { text: 'Add Quiz', icon: <QuizIcon />, path: '/admin/add-quiz' },
    { text: 'Add Questions', icon: <QuizIcon />, path: '/admin/add-questions' },
  ];

  const studentLinks = [
    { text: 'Take Quiz', icon: <DashboardIcon />, path: '/student/take-quiz' },
    { text: 'View Profile', icon: <DashboardIcon />, path: '/student/profile' },
    { text: 'Results', icon: <DashboardIcon />, path: '/student/results' },
    { text: 'Dummy', icon: <QuizIcon />, path: `/student/dummy` },
  ];

  const links =
    role === 'admin'
      ? [...commonLinks, ...adminLinks]
      : role === 'student'
      ? [...commonLinks, ...studentLinks]
      : commonLinks;

  return (
    <List className="sidebar">
      {links.map((link) => (
        <ListItem button component={Link} to={link.path} key={link.text}>
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.text} />
        </ListItem>
      ))}
    </List>
  );
};

export default Sidebar;
