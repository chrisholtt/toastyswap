const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const oneWei = 1000000000000000000;

describe("Toast Staking", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployToastStakingContract() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Toast = await ethers.getContractFactory("Toast");
        const toast = await Toast.deploy();

        const ToastStaking = await ethers.getContractFactory("ToastStaking");
        const toastStaking = await ToastStaking.deploy();

        return { toast, toastStaking, owner, otherAccount };
    }

    describe("Stake functions", function () {
        let toastFactory, toast, toastStakingFactory, toastStaking
        let deployer, address2


        beforeEach(async function () {
            toastFactory = await ethers.getContractFactory("Toast");
            toast = await toastFactory.deploy();

            toastStakingFactory = await ethers.getContractFactory("ToastStaking");
            toastStaking = await toastStakingFactory.deploy(toast.address);

            deployer = (await ethers.getSigner()).address;
            address2 = (await ethers.getSigners())[1].address;
        })

        it("Cannot stake unless allowance is set", async function () {
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await expect(toastStaking.stake(100)).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Can stake tokens", async function () {
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            const amountStaked = (await toastStaking.vault(deployer)).amount;
            assert.equal(amountStaked, 100);
        });

        it("Can withdraw tokens", async function () {
            let usersBalance, amountStaked;
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 0);
            assert.equal(amountStaked, 100);
            await toastStaking.withdraw(100);
            usersBalance = await toast.balanceOf(deployer);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            assert.equal(usersBalance, 100);
            assert.equal(amountStaked, 0);
        });

        it("Can 35% a year interest", async function () {
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            await time.increase(3600 * 24 * 365); // waiting a year
            const interestEarned = await toastStaking.earned(deployer);
            assert.equal(interestEarned, 35000000000000000000);
        });

        it("Can 70% interest from 2 year stake @35% APR", async function () {
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            await time.increase(3600 * 24 * 365 * 2); // waiting 2 years
            const interestEarned = await toastStaking.earned(deployer);
            const expectedEarnings = 100 * 0.35 * 2 * oneWei;
            assert.equal(interestEarned, expectedEarnings);
        });

        it("Can claim 1 years worth of interest", async function () {
            let amountStaked, usersBalance, rewards;
            await toast.addController(deployer);
            await toast.addController(toastStaking.address);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 0); // users balance to be 0
            assert.equal(amountStaked, 100); // staked balance to be 100
            await time.increase(3600 * 24 * 365); // waiting 1 year
            const interestEarned = await toastStaking.earned(deployer);
            const expectedEarnings = 100 * 0.35 * oneWei;
            assert.equal(interestEarned, expectedEarnings); // Expect interested to be 35% 
            await toastStaking.claimReward();
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 35);
            rewards = (await toastStaking.vault(deployer)).rewards;
            assert.equal(rewards, 0);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            assert.equal(amountStaked, 100);
        });

        it("Can claim and re-stake", async function () {
            let amountStaked, usersBalance, rewards;
            await toast.addController(deployer);
            await toast.addController(toastStaking.address);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            usersBalance = await toast.balanceOf(deployer);
            rewards = (await toastStaking.vault(deployer)).rewards;
            assert.equal(usersBalance, 0); // users balance to be 0
            assert.equal(amountStaked, 100); // staked balance to be 100
            assert.equal(rewards, 0); // rewards start at 0 
            await time.increase(3600 * 24 * 365); // waiting 1 year
            const interestEarned = await toastStaking.earned(deployer);
            const expectedEarnings = 100 * 0.35 * oneWei;
            assert.equal(interestEarned, expectedEarnings); // Expect interested to be 35% 
            await toastStaking.claimReward();
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 35); // users balance to be 35 after claim
            await toastStaking.stake(35);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            assert.equal(amountStaked, 135); // staked balance to be 100
            await time.increase(3600 * 24 * 365); // waiting 1 year
            await toastStaking.claimReward();
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 47); // users balance to be 47
            rewards = (await toastStaking.vault(deployer)).rewards;
            assert.equal(rewards, 0); // rewards to be 0
        });

        it("Can re-stake", async function () {
            let amountStaked, usersBalance, rewards;
            await toast.addController(deployer);
            await toast.addController(toastStaking.address);
            await toast.mint(deployer, 200);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            amountStaked = (await toastStaking.vault(deployer)).amount;
            usersBalance = await toast.balanceOf(deployer);
            rewards = (await toastStaking.vault(deployer)).rewards;
            assert.equal(usersBalance, 100); // users balance to be 0
            assert.equal(amountStaked, 100); // staked balance to be 100
            assert.equal(rewards, 0); // rewards start at 0 
            await time.increase(3600 * 24 * 365); // waiting 1 year
            rewards = (await toastStaking.earned(deployer));
            assert.equal(rewards, 35 * oneWei); // Expect interested to be 35% 
            await toastStaking.stake(100);
            await time.increase(3600 * 24 * 365); // waiting 1 year
            rewards = (await toastStaking.earned(deployer));
            assert.equal(rewards, 70 * oneWei); // Expect interested to be 35% 
        });


    });
});
