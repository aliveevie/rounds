import { config } from "@onflow/fcl";

const CONTRACT_ADDRESS = "0x0109b1ade020b5d7";

config({
  "app.detail.title": "Rounds",
  "app.detail.icon": "https://placeholdit.co/i/64x64",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "flow.network": "testnet",
  "walletconnect.projectId": "2c36ad052ffbb4d42ea115856c0fa089",
  "0xRounds": CONTRACT_ADDRESS,
});

export { CONTRACT_ADDRESS };
