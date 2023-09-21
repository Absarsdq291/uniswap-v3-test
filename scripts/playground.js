const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')

const { BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')

TETHER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'

const artifacts = {
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
    Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main(){
  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const usdtContract = new Contract(TETHER_ADDRESS,artifacts.Usdt.abi,provider)
  const usdcContract = new Contract(USDC_ADDRESS,artifacts.Usdc.abi,provider)

  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)

    // console.log(poolData)

    // console.log(Math.floor(Date.now() / 1000) + (60 * 10))

    // console.log(nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2)
    // console.log(nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2)

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

    // console.log(encodePriceSqrt(1,1));

  const tx = await usdtContract.connect(owner).balanceOf(USDT_USDC_500)
  
  const tx2 = await usdcContract.connect(owner).balanceOf(USDT_USDC_500)

  console.log(tx, tx2)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });