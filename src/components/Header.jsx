import React from 'react'
import  chefClaudeLogo  from '../assets/chef-claude-icon.png'



export default function Header () {
  return (
    <header>
        <img src={chefClaudeLogo}/>
        <h2>Chef Claude</h2>
    </header>
  )
}
