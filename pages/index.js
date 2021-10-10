
import { ethers } from "ethers";
import React, {useEffect} from 'react'
export default function App() {
  const checkIfWalletIsConnected = () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  }
/*
  * This runs our function when the page loads.
  */
  useEffect(() => { 
    checkIfWalletIsConnected();
  }, []);
  const wave = () => {
    
  }
  
  return (
    <div className="container mx-auto">

      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex text-3xl font-bold">
        👋 Hey there!
        </div>

        <div className="flex max-w-xl p-4">
        I am Michelet and I work at the University of São Paulo, so that's cool, right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="px-4 py-1 text-sm font-semibold text-red-600 border border-red-200 rounded-full hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  );
}
