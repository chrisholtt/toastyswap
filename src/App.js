import './App.css';
import Web3 from 'web3'
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Earn from './pages/EarnPage';
import Win from './pages/WinPage';
import SwapPage from './pages/SwapPage';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';



function App() {

  const [web3, setWeb3] = useState();

  const [userObj, setUserObj] = useState({
    isConnected: false,
    address: "",
    balance: 0.00
  });

  const providerOptions = {
    binancechainwallet: {
      package: true
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "a67f2ab200784a88b3d1c4710ae745bb"
      }
    },
    walletlink: {
      package: WalletLink,
      options: {
        appName: "Toasti",
        infuraId: "a67f2ab200784a88b3d1c4710ae745bb",
        rpc: "",
        chainId: 137,
        appLogoUrl: null,
        darkMode: true
      }
    }
  }

  const web3Modal = new Web3Modal({
    network: "polygon",
    them: "dark",
    cacheProvider: true,
    providerOptions
  })

  const onConnect = async () => {
    // Trying to connect to web3 provider
    try {
      const currentProvider = await web3Modal.connect();
      if (currentProvider) {
        await currentProvider.request({ method: 'eth_requestAccounts' })
        const web3 = new Web3(currentProvider);
        setWeb3(web3);
        // Getting user address
        const userAccount = await web3.eth.getAccounts();
        const account = userAccount[0];
        // Getting native balance
        let balance = await web3.eth.getBalance(account);
        const balanceInEther = web3.utils.fromWei(balance, 'ether')
        handleBalanceUpdate(Number(balanceInEther).toFixed(2));
        handleUserSignIn(account);
        connectUser(true);
        // Create local instance of contracts
      }
    } catch (err) {
      console.log(err);
      console.log("Failed to connect to web3 provider, try installing MetaMask");
    }
  }

  const connectUser = () => {
    setUserObj((prev) => {
      return { ...prev, isConnected: true }
    })
  }

  const disconnectUser = () => {
    setUserObj((prev) => {
      return { ...prev, isConnected: false }
    })
  }

  const handleUserSignIn = (address) => {
    setUserObj((prev) => {
      return { ...prev, address: address }
    })
  }

  const handleBalanceUpdate = (balance) => {
    setUserObj((prev) => {
      return { ...prev, balance: balance }
    })
  }



  return (
    <body>

      <section>
        <Navbar onConnect={onConnect} userObj={userObj} disconnectUser={disconnectUser} />
        <button onClick={() => web3Modal.clearCachedProvider()}>clear</button>
      </section>

      <section>
        <Routes>
          <Route path="/Swap" element={<SwapPage />} />
          <Route path="/Earn" element={<Earn />} />
          <Route path="/Win" element={<Win />} />
          <Route path="/Buy" element={<Win />} />
        </Routes>



      </section>







    </body>
  );
}

export default App;
