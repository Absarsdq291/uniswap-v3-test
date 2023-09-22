// Uniswap contract addresses
POSITION_MANAGER_ADDRESS= '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

// Pool addresses
USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'
USDT_USDC_3000= '0x177f4e9Ab346466a07274c8fa3ddc0B9BD8E976F'

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

const { Contract } = require("ethers")

async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

    params = {
        tokenId: 7,
        liquidity: ethers.utils.parseEther('0.1'),
        amount0Min: 0,
        amount1Min: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }

    const nonfungiblePositionManager = new Contract(
        POSITION_MANAGER_ADDRESS,
        artifacts.NonfungiblePositionManager.abi,
        provider
    )

    const tx = await nonfungiblePositionManager.connect(signer2).decreaseLiquidity(
        params,
        { gasLimit: '1000000' }
    )
    const receipt = await tx.wait()

    const eventInterface = new ethers.utils.Interface(artifacts.NonfungiblePositionManager.abi);
    const eventLog = receipt.logs.find(log => log.topics[0] === eventInterface.getEventTopic('DecreaseLiquidity'));
    
    const eventData = eventInterface.parseLog(eventLog);
    const amount0a = eventData.args.amount0.toNumber();
    const amount1b = eventData.args.amount1.toNumber();

    const tx3 = await nonfungiblePositionManager.connect(signer2).collect({
      tokenId: 7,
      recipient: signer2.address,
      amount0Max: amount0a,
      amount1Max: amount1b,
    });

    const receipt3 = await tx3.wait()

    const eventInterface3 = new ethers.utils.Interface(artifacts.NonfungiblePositionManager.abi);
    const eventLog3 = receipt.logs.find(log => log.topics[0] === eventInterface.getEventTopic('Collect'));
    
    const eventData3 = eventInterface.parseLog(eventLog);
    const amount0 = eventData.args.amount0.toNumber();
    const amount1 = eventData.args.amount1.toNumber();

    console.log("Returned Tokens:", amount0, amount1)
}

/*
npx hardhat run --network localhost scripts/07_removeLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });