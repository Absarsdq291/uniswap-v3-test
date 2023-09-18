// Token addresses
TETHER_ADDRESS= '0xc351628EB244ec633d5f21fBD6621e1a683B1181'
USDC_ADDRESS= '0xFD471836031dc5108809D173A067e8486B9047A3'
WRAPPED_BITCOIN_ADDRESS= '0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc'

// Uniswap contract address
WETH_ADDRESS= '0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575'
FACTORY_ADDRESS= '0xCD8a1C3ba11CF5ECfa6267617243239504a98d90'
SWAP_ROUTER_ADDRESS= '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1'
NFT_DESCRIPTOR_ADDRESS= '0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3'
POSITION_DESCRIPTOR_ADDRESS= '0x7969c5eD335650692Bc04293B07F5BF2e7A673C0'
POSITION_MANAGER_ADDRESS= '0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650'

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}


async function main() {
  const usdtUsdc500 = await deployPool(TETHER_ADDRESS, USDC_ADDRESS, 500, encodePriceSqrt(1, 1))
  console.log('USDT_USDC_500=', `'${usdtUsdc500}'`)
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });