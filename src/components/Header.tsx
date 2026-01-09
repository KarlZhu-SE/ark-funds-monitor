"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Box,
  alpha,
  styled,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useAppContext } from "../context/AppContext";

const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: "rgba(15, 23, 42, 0.8)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "none",
  position: "sticky",
  top: 0,
  zIndex: 1100,
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "30px",
  backgroundColor: alpha(theme.palette.common.white, 0.05),
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.08),
    borderColor: "rgba(99, 102, 241, 0.5)",
  },
  "&:focus-within": {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    borderColor: "#6366f1",
    boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.2)",
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#f8fafc",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: "width 0.3s ease",
    width: "100%",
    fontSize: "0.9rem",
    [theme.breakpoints.up("sm")]: {
      width: "15ch",
      "&:focus": {
        width: "25ch",
      },
    },
  },
}));

const Header = () => {
  const { ticker, setTicker } = useAppContext();
  const [inputTicker, setInputTicker] = useState(ticker);

  React.useEffect(() => {
    setInputTicker(ticker);
  }, [ticker]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputTicker(event.target.value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTicker(inputTicker.trim().toUpperCase());
  };

  return (
    <GlassAppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="logo"
            sx={{
              mr: 2,
              color: "#6366f1",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "12px",
              "&:hover": { background: "rgba(99, 102, 241, 0.2)" },
            }}
            href="/"
          >
            <ShowChartIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              display: { xs: "none", sm: "block" },
              color: "#f8fafc",
              textDecoration: "none",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: "1.4rem",
            }}
          >
            ARK <span style={{ color: "#6366f1" }}>FUNDS</span> MONITOR
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search TICKER..."
              inputProps={{ "aria-label": "search" }}
              value={inputTicker}
              onChange={handleChange}
            />
          </Search>
        </form>
      </Toolbar>
    </GlassAppBar>
  );
};

export default Header;
