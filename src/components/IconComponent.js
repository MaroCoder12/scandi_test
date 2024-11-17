import React from 'react';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa'; 

function IconComponent({ type }) {
  let Icon;

  if (type === 'login') {
    Icon = FaSignInAlt;
  } else if (type === 'signup') {
    Icon = FaUserPlus;
  } 
  else {
    return null; 
  }

  return (
      <Icon />
  );
}

export default IconComponent;
