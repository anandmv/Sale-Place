import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.div`
    overflow: hidden;
    background-color: #f1f1f1;
    padding: 20px 10px;
  
  /* Style the header links */
  a {
    float: left;
    color: black;
    text-align: center;
    padding: 12px;
    text-decoration: none;
    font-size: 18px; 
    line-height: 25px;
    border-radius: 4px;
  }
  
  /* Style the logo link (notice that we set the same value of line-height and font-size to prevent the header to increase when the font gets bigger */
  a.logo {
    font-size: 25px;
    font-weight: bold;
  }
  
  /* Change the background color on mouse-over */
  a:hover {
    background-color: #ddd;
    color: black;
  }
  
  /* Style the active/current link*/
  a.active {
    background-color: dodgerblue;
    color: white;
  }
  
  /* Float the link section to the right */
  .header-right {
    float: right;
  }
  
  /* Add media queries for responsiveness - when the screen is 500px wide or less, stack the links on top of each other */ 
  @media screen and (max-width: 500px) {
    .a {
      float: none;
      display: block;
      text-align: left;
    }
    .header-right {
      float: none;
    }
  }
`

const Header = () => <HeaderWrapper>
    <Link to="/" className="logo">Sale APP</Link>
    <div className="header-right">
        <Link to="/">Home</Link>
        <Link to="/item/create">Create</Link>
        <Link to="/purcahses">Purcahses</Link>
    </div>
</HeaderWrapper>

export default Header;