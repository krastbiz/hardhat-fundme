type NetworkConfig = {
    [key: number]: {
        name?: string
        ethUsdPriceFeed?: string
        blockConfirmations?: number
    }
}
export const networkConfig: NetworkConfig = {
    // Sepolia chain id
    11155111: {
        name: "Sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        blockConfirmations: 6,
    },
    // Polygon chain id
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    // hardhat chain id
    31337: {},
}

export const developmentChains = ["hardhat", "localhost"]
export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000
