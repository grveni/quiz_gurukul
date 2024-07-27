import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/AuthAPI';

const Layout = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
  ];

  const parentLinks = [
    {
      text: 'Student Progress',
      icon: <DashboardIcon />,
      path: '/parent/student-progress',
    },
    {
      text: 'Manage Profile',
      icon: <DashboardIcon />,
      path: '/parent/manage-profile',
    },
  ];

  const links =
    role === 'admin'
      ? [...commonLinks, ...adminLinks]
      : role === 'student'
      ? [...commonLinks, ...studentLinks]
      : role === 'parent'
      ? [...commonLinks, ...parentLinks]
      : commonLinks;

  return (
    <div className="wrapper">
      <AppBar position="fixed" className="header">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <Link to="/" className="brand-link">
          <span className="brand-text font-weight-light">Quiz System</span>
        </Link>
        <div className="sidebar">
          <nav className="mt-2">
            <List
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {links.map((link) => (
                <ListItem
                  button
                  component={Link}
                  to={link.path}
                  key={link.text}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItem>
              ))}
            </List>
          </nav>
        </div>
      </aside>

      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="float-right d-none d-sm-inline">Quiz System</div>
        <strong>
          Copyright &copy; 2024 <Link to="/">Quiz System</Link>.
        </strong>{' '}
        All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
