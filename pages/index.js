import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import wavePortal from '../utils/WavePortal.json'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import moment from 'moment'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [allWaves, setAllWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const contractAddress = '0x8D7F7F9f9448Dbdbb439d05684AD2374A34F5D1F'
  /**
   * Form related code.
   */
  const formik = useFormik({
    initialValues: { message: '' },
    validationSchema: Yup.object({
      message: Yup.string().required('Message Required'),
    }),
    onSubmit: (values) => {
      wave(values.message)
      formik.resetForm()
    },
  })

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          wavePortal.abi,
          signer
        )

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            isLucky: wave.isLucky,
          })
        })

        setAllWaves(wavesCleaned)

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on(
          'NewWave',
          (from, timestamp, message, isLucky) => {
            //console.log('NewWave', from, timestamp, message, isLucky)

            setAllWaves((prevState) => [
              ...prevState,
              {
                address: from,
                timestamp: new Date(timestamp * 1000),
                message: message,
                isLucky: isLucky,
              },
            ])
          }
        )
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error, 'error message')
    }
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (message) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          wavePortal.abi,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        })
        console.log('Mining...', waveTxn.hash)
        setLoading(true)
        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)
        setLoading(false)
        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    async function getData() {
      await checkIfWalletIsConnected()
      await getAllWaves()
    }
    getData()
  }, [])

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex text-3xl font-bold">👋 Oi Pessoal!</div>

        <div className="flex max-w-xl p-4">
          I am Michelet and I work at the University of São Paulo, so that's
          cool, right? Connect your Ethereum wallet and wave at me!
        </div>
        <form className="flex flex-col w-1/3" onSubmit={formik.handleSubmit}>
          <label htmlFor="message" className="font-semibold">
            Try to send me a message and, if your're lucky, you could get some
            ETH...
          </label>
          <input
            id="message"
            className="w-full px-2 border border-yellow-800 "
            type="text"
            {...formik.getFieldProps('message')}
          />
          {formik.touched.message && formik.errors.message ? (
            <div className="text-red-600">{formik.errors.message}</div>
          ) : null}
          <button
            type="submit"
            className="px-4 py-1 text-sm font-semibold text-red-600 border border-red-200 rounded-full hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Wave at Me
          </button>
        </form>
        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {loading ? (
          <div className="w-1/2 p-2 mt-2 font-mono bg-yellow-300">
            Please wait for the transaction to be mined
          </div>
        ) : (
          <div></div>
        )}
        {allWaves
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((wave, index) => {
            return (
              <div key={index} className="w-1/2 p-4 mt-3 bg-yellow-100">
                <div className="font-semibold">📣: {wave.message}</div>
                <div
                  className={
                    wave.isLucky ? 'text-sm text-green-600 ' : 'text-sm'
                  }
                >
                  From {wave.isLucky ? 'Lucky:' : ':'} {wave.address}
                </div>
                <div className="text-xs">
                  {moment(wave.timestamp.toISOString()).fromNow()}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
