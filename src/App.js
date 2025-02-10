import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import CarrierApp from './abis/CarrierApp.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [carrierapp, setCarrierApp] = useState(null)
  const [account, setAccount] = useState(null)
  const [cars, setCars] = useState(null)
  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()
    const carrierapp = new ethers.Contract(config[network.chainId].CarrierApp.address, CarrierApp, provider)
    setCarrierApp(carrierapp)
    console.log(carrierapp.address)
    const items = []
    for (var i = 0; i < 9; i++) {
      const item = await carrierapp.items(i+1)
      items.push(item)
    }

    const cars = items.filter((item) => item.category === 'Car')
    setCars(cars)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <h2>Vehicle App Best Sellers</h2>
      {cars &&(
        <>
          <Section title={"Cars"} items={cars} togglePop={togglePop} />
        </>
      )}
      {toggle && (
        <Product item={item} provider={provider} account={account} carrierapp={carrierapp} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
