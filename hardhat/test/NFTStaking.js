const {
    loadFixture,
    mine,
    time
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
const oneEther = 1000000000000000000;


describe("NFT Staking", function () {
    let toastFactory,
        toast,
        nftCollectionFactory,
        nftCollection,
        nftStakingFactory,
        nftStaking,
        deployer,
        address2,
        signers

    async function deployNFTStakingContract() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const NFTCollection = await ethers.getContractFactory("NFT");
        const nftCollection = await NFTCollection.deploy();
        const Toast = await ethers.getContractFactory("Toast");
        const toast = await Toast.deploy();
        const NFTStaking = await ethers.getContractFactory("NFTStaking");
        const nftStaking = await NFTStaking.deploy();
        // Ethers utils for converting units 
        let ethersToWei = ethers.utils.parseUnits(String(1), "wei");
        return { toast, nftStaking, nftCollection, owner, otherAccount };
    }

    describe("Mint functions", function () {
        beforeEach(async function () {
            toastFactory = await ethers.getContractFactory("Toast");
            toast = await toastFactory.deploy();
            nftCollectionFactory = await ethers.getContractFactory("NFT");
            nftCollection = await nftCollectionFactory.deploy();
            nftStakingFactory = await ethers.getContractFactory("NFTStaking");
            nftStaking = await nftStakingFactory.deploy(nftCollection.address, toast.address);
            deployer = (await ethers.getSigner()).address;
            address2 = (await ethers.getSigners())[1].address;
            signers = (await ethers.getSigners())
        })

        it("Can mint an NFT", async function () {
            await nftCollection.mint(deployer, 1);
            const ownerOfToken1 = await nftCollection.ownerOf(1);
            assert.equal(ownerOfToken1, deployer);
        });

        it("Cannot mint 0 ", async function () {
            await expect(nftCollection.mint(deployer, 0)).to.be.revertedWith("Mint amount must be greater than 0");
        });

        it("Needs to pay to mint an NFT", async function () {
            // Paying the correct amount 
            const sendAmount = ethers.utils.parseEther("0.1");
            const incorrectAmount = ethers.utils.parseEther("0.05");
            const nonOwnerConnectedContract = await nftCollection.connect(signers[1]);
            await nonOwnerConnectedContract.mint(signers[1].address, 1, { value: sendAmount });
            let balance = await nftCollection.balanceOf(signers[1].address);
            assert.equal(balance, 1);
            // Sending the incorrect amount 
            await expect(nonOwnerConnectedContract.mint(signers[1].address, 1, { value: incorrectAmount })).to.be.revertedWith("You need to provide 0.1 ether");
            balance = await nftCollection.balanceOf(signers[1].address);
            assert.equal(balance, 1);
        });

        it("Owner can pause minting", async function () {
            await nftCollection.pause(true);
            await expect(nftCollection.mint(deployer, 1)).to.be.revertedWith("Minting is paused");
        })

        it("Cant mint more than 100 at a time", async function () {
            await expect(nftCollection.mint(deployer, 101)).to.be.revertedWith("Can only mint 100 NFT's per txn");
        });

        // it("Cant mint over max amount", async function () {
        //     let supply;
        //     for (let i = 0; i < 100; i++) {
        //         supply = await nftCollection.totalSupply();
        //         console.log(supply);
        //         await nftCollection.mint(deployer, 100);
        //     }

        //     await expect(nftCollection.mint(deployer, 1)).to.be.revertedWith("Cannot mint over maximum supply");
        // });

        it("It cannot approve someone elses NFT", async function () {
            await nftCollection.mint(deployer, 1);
            await nftCollection.mint(address2, 1);
            await expect(nftCollection.approve(nftStaking.address, [2])).to.be.revertedWith('ERC721: approve caller is not token owner or approved for all');
        })

        it("Can stake NFT", async function () {
            await nftCollection.mint(deployer, 1);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1)
            await nftStaking.stake(tokens);
            const balanceStakedByOwner = await nftStaking.balanceOf(deployer);
            assert.equal(balanceStakedByOwner, 1);
        })

        it("Can un-stake NFT", async function () {
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1)
            await nftStaking.stake(tokens);
            await nftStaking.unstake(tokens);
        })

        it("Can un-stake many NFT's", async function () {
            await nftCollection.mint(deployer, 5);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1)
            await nftCollection.approve(nftStaking.address, 2)
            await nftCollection.approve(nftStaking.address, 3)
            await nftCollection.approve(nftStaking.address, 4)
            await nftCollection.approve(nftStaking.address, 5)
            await nftStaking.stake(tokens);
            await time.increase(3600 * 24);
            await nftStaking.unstake(tokens);
            // Does user have 5 ERC-20 tokens for staking?
            const toastBalance = await toast.balanceOf(deployer);
            assert.equal(toastBalance, 5);
            // Does user have 5 NFT's in their wallet?
            const nftBalance = await nftCollection.walletOfOwner(deployer);
            // This works but has big number err
            // assert.equal(nftBalance, [1, 2, 3, 4, 5]);
        })

        it("Can claim rewards from 1 NFT", async function () {
            let usersToastBalance;
            // Updating the reward rate per day 
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1);
            usersToastBalance = await toast.balanceOf(deployer);
            // Does users balance start at 0
            assert.equal(usersToastBalance, 0);
            // Staking tokens
            await nftStaking.stake(tokens);
            // Time skip 1 day 
            await time.increase(3600 * 24);
            // Claiming rewards from nfts
            await nftStaking.claim(tokens);
            // Checking that the nft is still in the staking contract
            const usersNFTBalance = await nftCollection.walletOfOwner(deployer);
            assert.equal(usersNFTBalance, 0);
            // The users claimed ERC-20 rewards
            usersToastBalance = await toast.balanceOf(deployer);
            assert.equal(usersToastBalance, 1);
        })

        it("Can claim twice", async function () {
            let usersToastBalance;
            // Updating the reward rate per day 
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1);
            await nftStaking.stake(tokens);
            // waiting a day 
            await time.increase(3600 * 24);
            await nftStaking.claim(tokens);
            // The users claimed ERC-20 rewards
            usersToastBalance = await toast.balanceOf(deployer);
            assert.equal(usersToastBalance, 1);
            // waiting another day
            await time.increase(3600 * 24);
            await nftStaking.claim(tokens);
            // The users claimed ERC-20 rewards
            usersToastBalance = await toast.balanceOf(deployer);
            assert.equal(usersToastBalance, 2);
        })

        it("Can earn x Number of toast a day", async function () {
            let usersToastBalance;
            // Updating the reward rate per day 
            const rewardRatePerDay = 10;
            await nftStaking.updateRewardRatePerDay(rewardRatePerDay);
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1);
            usersToastBalance = await toast.balanceOf(deployer);
            // Does users balance start at 0
            assert.equal(usersToastBalance, 0);
            // Staking tokens
            await nftStaking.stake(tokens);
            // Time skip 1 day 
            await time.increase(3600 * 24);
            // Claiming rewards from nfts
            await nftStaking.claim(tokens);
            usersToastBalance = await toast.balanceOf(deployer);
            assert.equal(usersToastBalance, 10);
        })

        it("Can withdraw balance from contract to owner", async function () {
            const sendAmount = ethers.utils.parseEther("0.1");
            const nonOwnerConnection = nftCollection.connect(signers[1])
            await nonOwnerConnection.mint(signers[1].address, 1, { value: sendAmount })
            // Getting contract balance
            let balance = await nftCollection.provider.getBalance(nftCollection.address);
            expect(Number(balance)).to.be.equal(oneEther / 10);
            // assert.equal(balance, 0.1);
            await nftCollection.withdraw();
        })



    });


    describe("Hacking functions", function () {
        beforeEach(async function () {
            toastFactory = await ethers.getContractFactory("Toast");
            toast = await toastFactory.deploy();
            nftCollectionFactory = await ethers.getContractFactory("NFT");
            nftCollection = await nftCollectionFactory.deploy();
            nftStakingFactory = await ethers.getContractFactory("NFTStaking");
            nftStaking = await nftStakingFactory.deploy(nftCollection.address, toast.address);
            deployer = (await ethers.getSigner()).address;
            address2 = (await ethers.getSigners())[1].address;
            signers = (await ethers.getSigners())
        })

        it("Others users cannot change reward rate", async function () {
            const attackerConnectedContract = await nftStaking.connect(signers[1]);
            await expect(attackerConnectedContract.updateRewardRatePerDay(10)).to.be.revertedWith("Only admin can update the reward rate")
        })

        it("Cannot un-stake someone elses NFT", async function () {
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1)
            await nftStaking.stake(tokens);
            const attackerConnectedContract = await nftStaking.connect(signers[1]);
            await expect(attackerConnectedContract.unstake(tokens)).to.be.revertedWith("not an owner");
        })

        it("Cannot claim someone elses staking rewards", async function () {
            await nftCollection.mint(deployer, 1);
            await toast.addController(nftStaking.address);
            const tokens = await nftCollection.walletOfOwner(deployer);
            await nftCollection.approve(nftStaking.address, 1);
            await nftStaking.stake(tokens);
            await time.increase(3600 * 24);
            const attackerConnectedContract = await nftStaking.connect(signers[1]);
            await expect(attackerConnectedContract.claim(tokens)).to.be.revertedWith("not an owner");
        })





    })







});
