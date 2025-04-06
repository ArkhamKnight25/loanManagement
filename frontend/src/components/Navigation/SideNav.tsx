import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Divider, Typography, Box, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Person as UserIcon,
  AttachMoney as LoanIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon,
  MonetizationOn as CashIcon,
  Assignment as ApplicationIcon,
  BarChart as StatsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2),
  backgroundColor: '#4CAF50',
  color: 'white',
  height: '64px'
}));

const AppTitle = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 'bold'
}));

const StyledDrawer = styled(Drawer)({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
  },
});

const Username = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2),
  fontWeight: 'bold'
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  color: '#333',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  }
}));

// Create a custom nav link component
const NavItem = ({ icon, text, path, isActive }: { icon: React.ReactNode; text: string; path: string; isActive: boolean }) => {
  return (
    <ListItem 
      sx={{
        cursor: 'pointer',
        backgroundColor: isActive ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(76, 175, 80, 0.08)',
        },
        mb: 0.5,
        borderRadius: 1
      }}
    >
      <Link 
        to={path}
        style={{ 
          textDecoration: 'none', 
          color: 'inherit', 
          display: 'flex', 
          width: '100%', 
          alignItems: 'center' 
        }}
      >
        <ListItemIcon style={{ color: '#4CAF50', minWidth: 40 }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} />
      </Link>
    </ListItem>
  );
};

interface SideNavProps {
  role: string;
}

const SideNav: React.FC<SideNavProps> = ({ role }) => {
  const history = useHistory();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Profile', icon: <UserIcon />, path: '/profile' },
      { text: 'Loan Applications', icon: <ApplicationIcon />, path: '/applications' },
    ];

    if (role === 'ADMIN') {
      return [
        ...baseItems,
        { text: 'Users', icon: <PeopleIcon />, path: '/users' },
        { text: 'Statistics', icon: <StatsIcon />, path: '/statistics' },
        { text: 'Reports', icon: <ReceiptIcon />, path: '/reports' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ];
    } else if (role === 'VERIFIER') {
      return [
        ...baseItems,
        { text: 'Loan Requests', icon: <LoanIcon />, path: '/loan-requests' },
        { text: 'Reports', icon: <ReceiptIcon />, path: '/reports' },
        { text: 'Statistics', icon: <StatsIcon />, path: '/statistics' },
      ];
    } else {
      return [
        ...baseItems,
        { text: 'My Loans', icon: <LoanIcon />, path: '/my-loans' },
        { text: 'Payments', icon: <CashIcon />, path: '/payments' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ];
    }
  };

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <DrawerHeader>
        <AppTitle>CREDIT APP</AppTitle>
      </DrawerHeader>
      <Divider />
      <Username>
        {currentUser?.username || 'User'}
      </Username>
      <Divider />
      <List sx={{ p: 1 }}>
        {getMenuItems().map((item) => (
          <NavItem 
            key={item.text}
            icon={item.icon}
            text={item.text}
            path={item.path}
            isActive={history.location.pathname === item.path}
          />
        ))}
      </List>
      <Box flexGrow={1} />
      <Divider />
      <LogoutButton
        fullWidth
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
      >
        Logout
      </LogoutButton>
    </StyledDrawer>
  );
};

export default SideNav; 