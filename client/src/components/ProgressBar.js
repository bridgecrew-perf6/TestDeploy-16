import React from "react";
import { Link } from 'react-router-dom';
import { StyledGrid } from '../styles';

const ProgressBar = (props) => {
    const { label, bgcolor, completed } = props;

    //----
    const containerStyles = {
        height: 28,
        width: '50%',
        backgroundColor: "#404040",
        borderRadius: 70,
        margin: 34
      }
    
      const fillerStyles = {
        height: '75%',
        width: `${completed}%`,
        backgroundColor: bgcolor,
        borderRadius: 'inherit',
        textAlign: 'right',
        color: "white"
      }
    
      const labelStyles = {
        padding: 5,
        color: 'white',
      }

    //---


    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
              <span>
                <p>{label}</p> 
                {`${completed}/100`}
              </span>
            </div>
        </div>
    );
}

export default ProgressBar;