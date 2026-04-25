import hre from "hardhat";

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("❌ ERROR: No deployer account found!");
    console.error("\nTo fix this:");
    console.error("1. Add your real private key to contracts/.env file");
    console.error("2. Get Base Sepolia ETH from: https://www.base.org/faucets");
    console.error("3. Format: PRIVATE_KEY=0x<your_64_char_key>");
    process.exit(1);
  }
  
  const [deployer] = signers;
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ ERROR: Account has no ETH!");
    console.error("\nGet free Base Sepolia ETH from: https://www.base.org/faucets");
    process.exit(1);
  }
  
  // Deploy ModelRegistry
  console.log("\n1. Deploying ModelRegistry...");
  const Registry = await hre.ethers.getContractFactory("ModelRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`   ModelRegistry: ${registryAddress}`);
  
  // Deploy AttestationRegistry
  console.log("\n2. Deploying AttestationRegistry...");
  const Attestation = await hre.ethers.getContractFactory("AttestationRegistry");
  const attestation = await Attestation.deploy(registryAddress);
  await attestation.waitForDeployment();
  const attestationAddress = await attestation.getAddress();
  console.log(`   AttestationRegistry: ${attestationAddress}`);

  await registry.setAttestationRegistry(attestationAddress);
  
  // Register a demo model
  console.log("\n3. Registering demo model...");
  const tx = await registry.registerModel(
    "Demo Fraud Detection",
    "v1.0.0",
    hre.ethers.keccak256(hre.ethers.toUtf8Bytes("demo_weights")),
    "ipfs://QmDemoModel"
  );
  await tx.wait();
  console.log("   Demo model registered");
  
  // Get all models to verify
  const models = await registry.getAllModels();
  console.log(`\n   Total models registered: ${models.length}`);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    modelRegistry: registryAddress,
    attestationRegistry: attestationAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };
  
  fs.writeFileSync(
    './deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log(`MODEL_REGISTRY: "${registryAddress}"`);
  console.log(`ATTESTATION_REGISTRY: "${attestationAddress}"`);
  console.log("\nView on Base Sepolia Explorer:");
  console.log(`https://sepolia.basescan.org/address/${registryAddress}`);
  console.log(`https://sepolia.basescan.org/address/${attestationAddress}`);
  console.log("\nDeployment info saved to deployment.json");
  
  // Verify contracts if on Base Sepolia
  if (hre.network.name === 'baseSepolia') {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise(r => setTimeout(r, 30000)); // Wait 30s for Etherscan indexing
    
    try {
      await hre.run('verify:verify', {
        address: registryAddress,
        constructorArguments: [],
      });
      console.log("✅ ModelRegistry verified");
    } catch (e) {
      console.log("⚠️ ModelRegistry verification failed:", e);
    }
    
    try {
      await hre.run('verify:verify', {
        address: attestationAddress,
        constructorArguments: [registryAddress],
      });
      console.log("✅ AttestationRegistry verified");
    } catch (e) {
      console.log("⚠️ AttestationRegistry verification failed:", e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
