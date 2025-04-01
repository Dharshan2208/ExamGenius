import { createTheme } from "@mui/material/styles";
import { blue, cyan, grey } from "@mui/material/colors";

// Define your custom theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[600], // Slightly darker blue, closer to example button
      light: blue[400],
      dark: blue[800],
      contrastText: "#ffffff",
    },
    secondary: {
      main: cyan[600], // Using cyan as an accent
      light: cyan[400],
      dark: cyan[800],
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff", // Plain white background like example
      paper: "#ffffff", // Keep paper white
    },
    text: {
      primary: grey[900],
      secondary: grey[600], // Slightly lighter secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700 }, // Bolder hero title
    h4: { fontWeight: 600, color: grey[900] }, // Feature section title (if used)
    h5: { fontWeight: 500, color: grey[700] }, // Hero subtitle
    h6: { fontWeight: 600, color: grey[900] }, // Card titles
    body2: { color: grey[700] }, // Card body text
  },
  shape: {
    borderRadius: 8, // Slightly less rounded than before
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Keep button text case as defined
          borderRadius: 6, // Match shape radius
        },
        containedPrimary: {
          // Add slight shadow to primary buttons like the example
          boxShadow: `0 4px 12px 0 ${blue[400]}40`,
          "&:hover": {
            boxShadow: `0 6px 16px 0 ${blue[500]}50`,
            backgroundColor: blue[700], // Darken on hover
          },
        },
      },
    },
    MuiPaper: {
      // Add slight shadow to paper elements for depth
      defaultProps: {
        elevation: 0, // Default to no elevation
      },
      styleOverrides: {
        root: {
          // Example: Add very subtle shadow variant if needed
          // '&.MuiPaper-elevation1': {
          //     boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
          // }
        },
      },
    },
    MuiAppBar: {
      // Keep AppBar flat and white/light
      defaultProps: {
        elevation: 0,
        color: "inherit", // Use inherit to allow white background
      },
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderBottom: `1px solid ${grey[200]}`, // Add subtle border line
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          // Match height if needed, e.g., minHeight: 64
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${grey[200]}`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: theme.spacing(3, 2),
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          flexGrow: 1,
          padding: theme.spacing(1, 0),
          width: "100%",
        }),
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "0 16px 16px", // Adjust if actions are added back
        },
      },
    },
    MuiLink: {
      // Link color matches primary
      styleOverrides: {
        root: {
          fontWeight: 500,
          color: blue[600],
          textDecorationColor: blue[200],
          "&:hover": {
            textDecorationColor: blue[600],
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: grey[50] },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: blue[100],
          color: blue[600],
          marginBottom: theme.spacing(2),
          width: 50,
          height: 50,
        }),
      },
    },
  },
});

export default theme;
