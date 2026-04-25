import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ModelRegistry } from "../typechain-types";

describe("ModelRegistry", function () {
  let registry: ModelRegistry;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const Registry = await hre.ethers.getContractFactory("ModelRegistry");
    registry = await Registry.deploy();
  });

  describe("Registration", function () {
    it("registers a model without tags", async function () {
      await registry.registerModel(
        "Fraud Detection Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("model_weights_v1")),
        "ipfs://QmTest123"
      );

      const modelIds = await registry.getOwnerModels(owner.address);
      expect(modelIds.length).to.equal(1);

      const model = await registry.getModel(modelIds[0]);
      expect(model.name).to.equal("Fraud Detection Model");
      expect(model.currentVersion).to.equal("v1.0.0");
      expect(model.owner).to.equal(owner.address);
      expect(model.isActive).to.equal(true);

      const tags = await registry.getModelTags(modelIds[0]);
      expect(tags).to.deep.equal([]);
    });

    it("registers a model with tags", async function () {
      await registry.registerModelWithTags(
        "Fraud Detection Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("model_weights_v1")),
        "ipfs://QmTest123",
        ["ml", "fraud"]
      );

      const modelIds = await registry.getOwnerModels(owner.address);
      const tags = await registry.getModelTags(modelIds[0]);
      expect(tags).to.deep.equal(["ml", "fraud"]);
    });

    it("emits ModelRegistered", async function () {
      await expect(
        registry.registerModel(
          "Test Model",
          "v1.0.0",
          hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash")),
          "ipfs://test"
        )
      )
        .to.emit(registry, "ModelRegistered")
        .withArgs(anyValue, owner.address, "Test Model", "v1.0.0", anyValue);
    });
  });

  describe("Updates", function () {
    it("allows owner to update model version", async function () {
      await registry.registerModel(
        "Test Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v1")),
        "ipfs://v1"
      );

      const [modelId] = await registry.getOwnerModels(owner.address);

      const newHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v2"));
      await registry.updateModelVersion(modelId, "v1.1.0", newHash, "Improved accuracy", "ipfs://v2");

      const model = await registry.getModel(modelId);
      expect(model.modelHash).to.equal(newHash);
      expect(model.currentVersion).to.equal("v1.1.0");
      expect(model.metadataURI).to.equal("ipfs://v2");
      expect(model.totalVersions).to.equal(2);

      const history = await registry.getModelVersionHistory(modelId);
      expect(history.length).to.equal(2);
      expect(history[0].version).to.equal("v1.0.0");
      expect(history[1].version).to.equal("v1.1.0");
      expect(history[1].changeNotes).to.equal("Improved accuracy");
    });

    it("prevents non-owner from updating", async function () {
      await registry.registerModel(
        "Test Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v1")),
        "ipfs://v1"
      );

      const [modelId] = await registry.getOwnerModels(owner.address);

      await expect(
        registry.connect(addr1).updateModelVersion(
          modelId,
          "v1.1.0",
          hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v2")),
          "Hacked",
          "ipfs://hacked"
        )
      ).to.be.revertedWith("Not model owner");
    });

    it("allows owner to deactivate and reactivate model", async function () {
      await registry.registerModel(
        "Test",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test")),
        "ipfs://test"
      );

      const [modelId] = await registry.getOwnerModels(owner.address);

      await registry.deactivateModel(modelId);
      expect((await registry.getModel(modelId)).isActive).to.equal(false);

      await registry.reactivateModel(modelId);
      expect((await registry.getModel(modelId)).isActive).to.equal(true);
    });

    it("allows owner to update tags", async function () {
      await registry.registerModelWithTags(
        "Test",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test")),
        "ipfs://test",
        ["old"]
      );

      const [modelId] = await registry.getOwnerModels(owner.address);
      await registry.updateModelTags(modelId, ["new", "tags"]);

      const tags = await registry.getModelTags(modelId);
      expect(tags).to.deep.equal(["new", "tags"]);
    });
  });

  describe("Fee Logic", function () {
    it("has correct default fee settings", async function () {
      const fee = await registry.registrationFee();
      const feesEnabled = await registry.feesEnabled();

      expect(fee).to.equal(hre.ethers.parseEther("0.001"));
      expect(feesEnabled).to.equal(false);
    });

    it("allows free registration when fees disabled", async function () {
      const tx = await registry.registerModel(
        "Free Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("free")),
        "ipfs://free",
        { value: 0 }
      );

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);
    });

    it("rejects registration with insufficient funds when fees enabled", async function () {
      await registry.toggleFees();

      await expect(
        registry.registerModel(
          "Paid Model",
          "v1.0.0",
          hre.ethers.keccak256(hre.ethers.toUtf8Bytes("paid")),
          "ipfs://paid",
          { value: hre.ethers.parseEther("0.0001") }
        )
      ).to.be.revertedWith("Insufficient registration fee");
    });

    it("accepts registration with correct fee when fees enabled", async function () {
      await registry.toggleFees();
      const fee = await registry.registrationFee();

      const tx = await registry.registerModel(
        "Paid Model",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("paid")),
        "ipfs://paid",
        { value: fee }
      );

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const totalFees = await registry.totalFeesCollected();
      expect(totalFees).to.equal(fee);
    });

    it("tracks total fees collected correctly", async function () {
      await registry.toggleFees();
      const fee = await registry.registrationFee();

      await registry.registerModel(
        "Model 1",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("1")),
        "ipfs://1",
        { value: fee }
      );
      await registry.registerModel(
        "Model 2",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("2")),
        "ipfs://2",
        { value: fee }
      );

      const totalFees = await registry.totalFeesCollected();
      expect(totalFees).to.equal(fee * 2n);
    });

    it("allows owner to update registration fee", async function () {
      const newFee = hre.ethers.parseEther("0.002");
      await registry.setRegistrationFee(newFee);

      const fee = await registry.registrationFee();
      expect(fee).to.equal(newFee);
    });

    it("prevents non-owner from updating fee", async function () {
      await expect(
        registry.connect(addr1).setRegistrationFee(hre.ethers.parseEther("0.01"))
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("allows owner to toggle fees", async function () {
      await registry.toggleFees();
      expect(await registry.feesEnabled()).to.equal(true);

      await registry.toggleFees();
      expect(await registry.feesEnabled()).to.equal(false);
    });

    it("allows owner to withdraw funds", async function () {
      await registry.toggleFees();
      const fee = await registry.registrationFee();
      await registry.registerModel(
        "Model",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("m")),
        "ipfs://m",
        { value: fee }
      );

      const initialBalance = await hre.ethers.provider.getBalance(owner.address);
      await registry.withdrawFunds(owner.address, fee);
      const finalBalance = await hre.ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance - hre.ethers.parseEther("0.01"));
    });

    it("prevents non-owner from withdrawing", async function () {
      await expect(
        registry.connect(addr1).withdrawFunds(addr1.address, hre.ethers.parseEther("0.001"))
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("allows owner to authorize verifier", async function () {
      await registry.authorizeVerifier(addr1.address);
      expect(await registry.authorizedVerifiers(addr1.address)).to.equal(true);
    });

    it("allows owner to revoke verifier", async function () {
      await registry.authorizeVerifier(addr1.address);
      await registry.revokeVerifier(addr1.address);
      expect(await registry.authorizedVerifiers(addr1.address)).to.equal(false);
    });

    it("prevents non-owner from authorizing verifiers", async function () {
      await expect(registry.connect(addr1).authorizeVerifier(addr2.address)).to.be.revertedWithCustomError(
        registry,
        "OwnableUnauthorizedAccount"
      );
    });

    it("allows authorized verifier to certify a model version", async function () {
      await registry.registerModel(
        "Test",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test")),
        "ipfs://test"
      );
      const [modelId] = await registry.getOwnerModels(owner.address);

      await registry.updateModelVersion(
        modelId,
        "v1.1.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v2")),
        "Update",
        "ipfs://v2"
      );

      await registry.authorizeVerifier(addr1.address);
      await registry.connect(addr1).certifyModelVersion(modelId, 1);

      const history = await registry.getModelVersionHistory(modelId);
      expect(history[1].isCertified).to.equal(true);
      expect(history[1].certifiedBy).to.equal(addr1.address);
    });

    it("prevents unauthorized address from certifying", async function () {
      await registry.registerModel(
        "Test",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test")),
        "ipfs://test"
      );
      const [modelId] = await registry.getOwnerModels(owner.address);

      await registry.updateModelVersion(
        modelId,
        "v1.1.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v2")),
        "Update",
        "ipfs://v2"
      );

      await expect(registry.connect(addr1).certifyModelVersion(modelId, 1)).to.be.revertedWith("Not authorized");
    });
  });

  describe("Queries", function () {
    it("returns all models", async function () {
      await registry.registerModel(
        "Model 1",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("1")),
        "ipfs://1"
      );
      await registry.registerModel(
        "Model 2",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("2")),
        "ipfs://2"
      );

      const allModels = await registry.getAllModels();
      expect(allModels.length).to.equal(2);
      expect(allModels[0].name).to.equal("Model 1");
      expect(allModels[1].name).to.equal("Model 2");
    });

    it("returns only active models", async function () {
      await registry.registerModel(
        "Active",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("a")),
        "ipfs://a"
      );
      await registry.registerModel(
        "ToDeactivate",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("d")),
        "ipfs://d"
      );

      const modelIds = await registry.getOwnerModels(owner.address);
      await registry.deactivateModel(modelIds[1]);

      const activeModels = await registry.getActiveModels();
      expect(activeModels.length).to.equal(1);
      expect(activeModels[0].name).to.equal("Active");
    });

    it("returns correct owner models", async function () {
      await registry.registerModel(
        "Owner Model",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("owner")),
        "ipfs://owner"
      );
      await registry
        .connect(addr1)
        .registerModel("Addr1 Model", "v1", hre.ethers.keccak256(hre.ethers.toUtf8Bytes("addr1")), "ipfs://addr1");

      const ownerModels = await registry.getOwnerModels(owner.address);
      expect(ownerModels.length).to.equal(1);

      const addr1Models = await registry.getOwnerModels(addr1.address);
      expect(addr1Models.length).to.equal(1);
    });

    it("returns model version history", async function () {
      await registry.registerModel(
        "Test",
        "v1.0.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v1")),
        "ipfs://v1"
      );
      const [modelId] = await registry.getOwnerModels(owner.address);

      await registry.updateModelVersion(
        modelId,
        "v1.1.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v2")),
        "Update 1",
        "ipfs://v2"
      );
      await registry.updateModelVersion(
        modelId,
        "v1.2.0",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("v3")),
        "Update 2",
        "ipfs://v3"
      );

      const history = await registry.getModelVersionHistory(modelId);
      expect(history.length).to.equal(3);
      expect(history[1].version).to.equal("v1.1.0");
      expect(history[2].version).to.equal("v1.2.0");
    });
  });

  describe("Edge Cases", function () {
    it("handles empty tags array", async function () {
      await registry.registerModelWithTags(
        "No Tags",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash")),
        "ipfs://test",
        []
      );

      const [modelId] = await registry.getOwnerModels(owner.address);
      const tags = await registry.getModelTags(modelId);
      expect(tags).to.deep.equal([]);
    });

    it("handles model with many tags", async function () {
      const manyTags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
      await registry.registerModelWithTags(
        "Many Tags",
        "v1",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("hash")),
        "ipfs://test",
        manyTags
      );

      const [modelId] = await registry.getOwnerModels(owner.address);
      const tags = await registry.getModelTags(modelId);
      expect(tags.length).to.equal(5);
    });

    it("allows version hash collisions", async function () {
      const sameHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("same"));
      await registry.registerModel("Test", "v1.0.0", sameHash, "ipfs://v1");
      const [modelId] = await registry.getOwnerModels(owner.address);

      await registry.updateModelVersion(modelId, "v1.1.0", sameHash, "Same hash", "ipfs://v2");

      const history = await registry.getModelVersionHistory(modelId);
      expect(history.length).to.equal(2);
      expect(history[0].versionHash).to.equal(sameHash);
      expect(history[1].versionHash).to.equal(sameHash);
    });
  });
});
