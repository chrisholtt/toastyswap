const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

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
            toastStaking = await toastStakingFactory.deploy(toast.address, toast.address);

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
            const ammountStaked = await toastStaking.s_balances(deployer);
            assert.equal(ammountStaked, 100);
        });

        it("Can withdraw tokens", async function () {
            let usersBalance, amountStaked;
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            amountStaked = await toastStaking.s_balances(deployer);
            usersBalance = await toast.balanceOf(deployer);
            assert.equal(usersBalance, 0);
            assert.equal(amountStaked, 100);
            await toastStaking.withdraw(100);
            usersBalance = await toast.balanceOf(deployer);
            amountStaked = await toastStaking.s_balances(deployer);
            assert.equal(usersBalance, 100);
            assert.equal(amountStaked, 0);
        });

        it("Can earn interest", async function () {
            await toast.addController(deployer);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            await mine(1);
            const interestEarned = await toastStaking.earned(deployer);
            assert.equal(interestEarned, 100);
        });

        it("Can earn interest and claim", async function () {
            await toast.addController(deployer);
            await toast.addController(toastStaking.address);
            await toast.mint(deployer, 100);
            await toast.approve(toastStaking.address, 1000000000);
            await toastStaking.stake(100);
            await mine(1);
            await toastStaking.claimReward();
            const updatedBalance = await toast.balanceOf(deployer);
            assert.equal(updatedBalance, 200);
        });


    });
});
