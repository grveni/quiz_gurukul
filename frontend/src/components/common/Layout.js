import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/AuthAPI';
import { getUserId } from '../../utils/UserAPI';

const TEST_USER_ID = Number('10'); // Replace with the actual test user ID

const Layout = ({ role }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false); // State to handle drawer toggle for mobile/tablet view
  const [isTestUser, setIsTestUser] = useState(false); // State to check if current user is a test user
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Breakpoint for mobile
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Breakpoint for tablet/iPad

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Fetch user profile and check if the user is the test user
    const fetchUserProfile = async () => {
      try {
        const userId = await getUserId();
        if (userId === TEST_USER_ID) {
          console.log('test user');
          setIsTestUser(true);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const commonLinks = [
    { text: 'Quizzes', icon: <QuizIcon />, path: `/${role}/quizzes` },
  ];

  const adminLinks = [
    {
      text: 'Manage Users',
      icon: <DashboardIcon />,
      path: '/admin/manage-users',
    },
    { text: 'Add Quiz', icon: <QuizIcon />, path: '/admin/add-quiz' },
    { text: 'Add Questions', icon: <QuizIcon />, path: '/admin/add-questions' },
    {
      text: 'View Responses',
      icon: <QuizIcon />,
      path: '/admin/view-responses',
    },
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

  // Conditionally add the "All Quizzes" link for the test user
  if (isTestUser) {
    studentLinks.push({
      text: 'All Quizzes',
      icon: <QuizIcon />,
      path: '/student/all-quizzes',
    });
  }

  const links =
    role === 'admin'
      ? [...commonLinks, ...adminLinks]
      : role === 'student'
      ? [...commonLinks, ...studentLinks]
      : role === 'parent'
      ? [...commonLinks, ...parentLinks]
      : commonLinks;

  // Drawer toggle functions
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = () => {
    if (isMobile || isTablet) {
      setDrawerOpen(false); // Close the drawer after a menu item is clicked
    }
  };

  const renderSidebar = () => (
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
            onClick={handleMenuItemClick} // Close the drawer here
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
    </nav>
  );

  return (
    <div className="wrapper">
      <AppBar position="fixed" className="header">
        <Toolbar>
          {(isMobile || isTablet) && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ marginRight: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar - as a Drawer for mobile/tablet */}
      {isMobile || isTablet ? (
        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
          {renderSidebar()}
        </Drawer>
      ) : (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">
          <Link to="/" className="brand-link">
            <span className="brand-text font-weight-light">Quiz System</span>
          </Link>
          <div className="sidebar">{renderSidebar()}</div>
        </aside>
      )}

      <div
        className="content-wrapper"
        style={{
          marginTop: isMobile ? '56px' : '64px', // Adjust margin for app bar based on screen size
        }}
      >
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
