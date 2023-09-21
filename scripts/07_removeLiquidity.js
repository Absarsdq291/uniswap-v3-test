// Uniswap contract addresses
WETH_ADDRESS= '0x5FbDB2315678afecb367f032d93F642f64180aa3'
FACTORY_ADDRESS= '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
SWAP_ROUTER_ADDRESS= '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
NFT_DESCRIPTOR_ADDRESS= '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
POSITION_DESCRIPTOR_ADDRESS= '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
POSITION_MANAGER_ADDRESS= '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

// Pool addresses
USDT_USDC_500= '0x1FA8DDa81477A5b6FA1b2e149e93ed9C7928992F'
USDT_USDC_3000= '0x177f4e9Ab346466a07274c8fa3ddc0B9BD8E976F'

// Token addresses
TETHER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
WRAPPED_BITCOIN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'

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

    params = {
        tokenId: 2,
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
    const amount0 = eventData.args.amount0.toNumber();
    const amount1 = eventData.args.amount1.toNumber();
    console.log('Returned tokens:', amount0, amount1);

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