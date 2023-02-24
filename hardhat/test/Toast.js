const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");

describe("Toast", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Toast = await ethers.getContractFactory("Toast");
    const toast = await Toast.deploy();

    return { toast, owner, otherAccount };
  }

  describe("Mint functions", function () {
    let toastFactory, toast
    const sendAmount = ethers.utils.parseEther("1");
    let deployer, address2


    beforeEach(async function () {
      toastFactory = await ethers.getContractFactory("Toast");
      toast = await toastFactory.deploy();
      deployer = (await ethers.getSigner()).address;
      address2 = (await ethers.getSigners())[1].address

    })

    it("Should not be able to mint", async function () {
      await expect(toast.mint(deployer, 100)).to.be.revertedWith("Only controllers can mint");
    });

    it("Should be able to add a controller", async function () {
      await toast.addController(deployer);
      const canControllerMint = await toast.controllers(deployer);
      assert.equal(canControllerMint, true);
    });

    it("Should be able to add a controller then remove it", async function () {
      let canControllerMint;
      await toast.addController(deployer);
      canControllerMint = await toast.controllers(deployer);
      assert.equal(canControllerMint, true);
      await toast.removeController(deployer);
      canControllerMint = await toast.controllers(deployer);
      assert.equal(canControllerMint, false);
    });

    it("Should be able to mint tokens", async function () {
      await toast.addController(deployer);
      await toast.mint(deployer, 100);
      const totalSupply = await toast.getTotalSupply();
      assert.equal(totalSupply, 100);
    });

    it("Cannot mint over MAX supply", async function () {
      const maxSupply = await toast.getMaxSupply();
      await toast.addController(deployer);
      await expect(toast.mint(deployer, maxSupply + 1)).to.be.revertedWith("Maximum supply has been reached");
    });

    it("Can mint and get balance of owner", async function () {
      await toast.addController(deployer);
      await toast.mint(deployer, 100);
      const ownersBalance = await toast.balanceOf(deployer);
      assert.equal(ownersBalance, 100);
    });

    it("Can send tokens", async function () {
      await toast.addController(deployer);
      await toast.mint(deployer, 100);
      await toast.transfer(address2, 100);
      const sendersBalance = await toast.balanceOf(deployer);
      const receiversBalance = await toast.balanceOf(address2);
      assert.equal(receiversBalance, 100);
      assert.equal(sendersBalance, 0);
    });

    it("Can burn tokens", async function () {
      await toast.addController(deployer);
      await toast.mint(deployer, 100);
      await toast.burn(100);
      const burnersBalance = await toast.balanceOf(deployer);
      assert.equal(burnersBalance, 0);
    });





  });
});
