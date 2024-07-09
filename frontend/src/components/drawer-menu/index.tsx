import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Logo from '../../assets/b3logo.png'
import LogoShort from '../../assets/b3logoShort.png'
import { MantineProvider, CSSVariablesResolver } from '@mantine/core';
import { IconHome, IconInbox } from '@tabler/icons-react';
import { Link } from "react-router-dom";


const drawerWidth = 200;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const openStyle = {
  backgroundImage: `url(${Logo})`,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundColor: "#EAE5DF",
  paddingRight: "0px",
}

const closedStyle = {
  backgroundColor: "#EAE5DF",
  paddingRight: "0px",
  
}

const resolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--mantine-hero-height': theme.other.heroHeight,
  },
  light: {
    '--mantine-color-deep-orange': theme.other.deepOrangeLight,
  },
  dark: {
    '--mantine-color-deep-orange': theme.other.deepOrangeDark,
  },
});


export default function DrawerMenu() {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  return (
    <MantineProvider
    cssVariablesResolver={resolver}
  >
    <Box sx={{ display: 'flex' }}>
      {/* <CssBaseline /> */}
      <Drawer variant="permanent" open={open} >
        <DrawerHeader style={open? openStyle:closedStyle}>
          { open ?
            <IconButton onClick={handleDrawerClose} style={{outline:"none"}}>
              <ChevronLeftIcon />
            </IconButton>
            : 
            <>
              <img src={LogoShort} style={{
                width: "70%",
                minHeight:"50px",
                backgroundColor: "#EAE5DF",
                marginLeft:"7px",
                marginRight:"7px"
            }}
            ></img>
              <IconButton onClick={handleDrawerOpen} style={{outline:"none", paddingRight: "0px", paddingLeft:"0px", width:"5px", height:"5px"}}>
                <ChevronRightIcon style={{padding: "0px", margin:"0px", paddingRight: "5px"}}/>
              </IconButton>
            </>
        } 
        </DrawerHeader>
        <Divider />
        <List>
          <Link to="/">
            <ListItem key={"Inicio"} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <IconHome />
                </ListItemIcon>
                <ListItemText primary={"Início"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </Link>
          <Link to="/upload">
            <ListItem key={"Upload"} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <IconInbox />
                </ListItemIcon>
                <ListItemText primary={"Upload"} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </Link>
        </List>
      </Drawer>
    </Box>
    </MantineProvider>
  );
}