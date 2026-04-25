import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { AttestationRegistry, ModelRegistry } from "../typechain-types";

describe("AttestationRegistry", function () {
  let registry: ModelRegistry;
  let attestationRegistry: AttestationRegistry;
  let owner: any;
  let addr1: any;

  async function signPrediction(
    signer: any,
    modelId: string,
    inputHash: string,
    outputHash: string,
    deadline: bigint
  ) {
    const network = await hre.ethers.provider.getNetwork();
    const domain = {
      name: "VerifiableAI",
      version: "1",
      chainId: Number(network.chainId),
      verifyingContract: await attestationRegistry.getAddress(),
    };

    const types = {
      PredictionData: [
        { name: "modelId", type: "bytes32" },
        { name: "inputHash", type: "bytes32" },
        { name: "outputHash", type: "bytes32" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const message = {
      modelId,
      inputHash,
      outputHash,
      deadline,
    };

    const signature = await signer.signTypedData(domain, types, message);
    return hre.ethers.Signature.from(signature);
  }

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();

    const Registry = await hre.ethers.getContractFactory("ModelRegistry");
    registry = await Registry.deploy();

    const Attestation = await hre.ethers.getContractFactory("AttestationRegistry");
    attestationRegistry = await Attestation.deploy(await registry.getAddress());

    await registry.setAttestationRegistry(await attestationRegistry.getAddress());
  });

  describe("Attestation Creation", function () {
    let modelId: string;
    let inputHash: string;
    let outputHash: string;

    beforeEach(async function () {
      await registry.registerModel(
        "Fraud Detection",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("weights")),
        "ipfs://model"
      );

      const models = await registry.getOwnerModels(owner.address);
      modelId = models[0];

      inputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test_input"));
      outputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test_output"));
    });

    it("creates attestation with valid signature and deadline", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(owner, modelId, inputHash, outputHash, deadline);

      const tx = await attestationRegistry.createAttestation(
        modelId,
        inputHash,
        outputHash,
        "ipfs://test",
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const isAttested = await attestationRegistry.isPredictionAttested(inputHash, outputHash);
      expect(isAttested).to.equal(true);

      const model = await registry.getModel(modelId);
      expect(model.attestationsCount).to.equal(1);
      expect(await registry.totalAttestations()).to.equal(1);
    });

    it("rejects attestation for non-existent model", async function () {
      const fakeModelId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("fake"));
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      await expect(
        attestationRegistry.createAttestation(
          fakeModelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          27,
          hre.ethers.ZeroHash,
          hre.ethers.ZeroHash
        )
      ).to.be.revertedWith("Model not found");
    });

    it("rejects attestation for inactive model", async function () {
      await registry.deactivateModel(modelId);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          27,
          hre.ethers.ZeroHash,
          hre.ethers.ZeroHash
        )
      ).to.be.revertedWith("Model not active");
    });

    it("rejects attestation with expired deadline", async function () {
      const expiredDeadline = BigInt(Math.floor(Date.now() / 1000) - 3600);

      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          expiredDeadline,
          27,
          hre.ethers.ZeroHash,
          hre.ethers.ZeroHash
        )
      ).to.be.revertedWith("Signature expired");
    });

    it("rejects attestation with invalid signature", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          27,
          hre.ethers.ZeroHash,
          hre.ethers.ZeroHash
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("rejects attestation signed by non-owner", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(addr1, modelId, inputHash, outputHash, deadline);

      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).to.be.revertedWith("Invalid signature");
    });

    it("prevents duplicate predictions", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(owner, modelId, inputHash, outputHash, deadline);

      await attestationRegistry.createAttestation(
        modelId,
        inputHash,
        outputHash,
        "ipfs://test",
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      const sig2 = await signPrediction(owner, modelId, inputHash, outputHash, deadline + 1n);
      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test2",
          deadline + 1n,
          sig2.v,
          sig2.r,
          sig2.s
        )
      ).to.be.revertedWith("Prediction already attested");
    });

    it("emits AttestationCreated event", async function () {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(owner, modelId, inputHash, outputHash, deadline);

      await expect(
        attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      )
        .to.emit(attestationRegistry, "AttestationCreated")
        .withArgs(anyValue, modelId, inputHash, outputHash, owner.address, deadline, "ipfs://test");
    });
  });

  describe("Attestation Revocation", function () {
    let modelId: string;
    let attestationId: string;
    let inputHash: string;
    let outputHash: string;

    beforeEach(async function () {
      await registry.registerModel(
        "Test Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("weights")),
        "ipfs://model"
      );

      const models = await registry.getOwnerModels(owner.address);
      modelId = models[0];

      inputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("input"));
      outputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("output"));

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(owner, modelId, inputHash, outputHash, deadline);

      await (
        await attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).wait();

      const attestations = await attestationRegistry.getModelAttestations(modelId);
      attestationId = attestations[0];
    });

    it("allows owner to revoke attestation", async function () {
      await attestationRegistry.revokeAttestation(attestationId, "Test revocation");

      const attestation = await attestationRegistry.getAttestation(attestationId);
      expect(attestation.isRevoked).to.equal(true);
    });

    it("prevents non-owner from revoking", async function () {
      await expect(attestationRegistry.connect(addr1).revokeAttestation(attestationId, "Unauthorized")).to.be.revertedWith(
        "Only owner can revoke"
      );
    });

    it("prevents double revocation", async function () {
      await attestationRegistry.revokeAttestation(attestationId, "First revocation");

      await expect(attestationRegistry.revokeAttestation(attestationId, "Second revocation")).to.be.revertedWith(
        "Already revoked"
      );
    });

    it("emits AttestationRevoked event", async function () {
      await expect(attestationRegistry.revokeAttestation(attestationId, "Test reason"))
        .to.emit(attestationRegistry, "AttestationRevoked")
        .withArgs(attestationId, "Test reason");
    });
  });

  describe("Attestation Queries", function () {
    let modelId: string;
    let inputHash: string;
    let outputHash: string;
    let attestationId: string;

    beforeEach(async function () {
      await registry.registerModel(
        "Test Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("weights")),
        "ipfs://model"
      );

      const models = await registry.getOwnerModels(owner.address);
      modelId = models[0];

      inputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("input"));
      outputHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("output"));

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const sig = await signPrediction(owner, modelId, inputHash, outputHash, deadline);

      await (
        await attestationRegistry.createAttestation(
          modelId,
          inputHash,
          outputHash,
          "ipfs://test",
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).wait();

      const attestations = await attestationRegistry.getModelAttestations(modelId);
      attestationId = attestations[0];
    });

    it("returns attestation details", async function () {
      const attestation = await attestationRegistry.getAttestation(attestationId);

      expect(attestation.modelId).to.equal(modelId);
      expect(attestation.inputHash).to.equal(inputHash);
      expect(attestation.outputHash).to.equal(outputHash);
      expect(attestation.metadataURI).to.equal("ipfs://test");
      expect(attestation.isRevoked).to.equal(false);
    });

    it("returns model attestations", async function () {
      const attestations = await attestationRegistry.getModelAttestations(modelId);
      expect(attestations.length).to.equal(1);
      expect(attestations[0]).to.equal(attestationId);
    });

    it("verifies attestation correctly", async function () {
      const result = await attestationRegistry.verifyAttestation(modelId, inputHash, outputHash);
      expect(result.isValid).to.equal(true);
      expect(result.attestationId).to.equal(attestationId);
    });

    it("returns invalid for non-existent attestation", async function () {
      const fakeInput = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("fake"));
      const result = await attestationRegistry.verifyAttestation(modelId, fakeInput, outputHash);
      expect(result.isValid).to.equal(false);
      expect(result.attestationId).to.equal(hre.ethers.ZeroHash);
    });

    it("checks if prediction is attested", async function () {
      const isAttested = await attestationRegistry.isPredictionAttested(inputHash, outputHash);
      expect(isAttested).to.equal(true);
    });

    it("returns correct PREDICTION_TYPEHASH", async function () {
      const typehash = await attestationRegistry.PREDICTION_TYPEHASH();
      const expectedTypehash = hre.ethers.keccak256(
        hre.ethers.toUtf8Bytes("PredictionData(bytes32 modelId,bytes32 inputHash,bytes32 outputHash,uint256 deadline)")
      );
      expect(typehash).to.equal(expectedTypehash);
    });
  });
});
