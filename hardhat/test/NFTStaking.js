const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Staking", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployNFTStakingContract() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const NFTCollection = await ethers.getContractFactory("NFT");
        const nftCollection = await NFTCollection.deploy();

        const Toast = await ethers.getContractFactory("Toast");
        const toast = await Toast.deploy();

        const NFTStaking = await ethers.getContractFactory("NFTStaking");
        const nftStaking = await NFTStaking.deploy();

        return { toast, nftStaking, nftCollection, owner, otherAccount };
    }

    describe("Mint functions", function () {
        let toastFactory,
            toast,
            nftCollectionFactory,
            nftCollection,
            nftStakingFactory,
            nftStaking,
            deployer,
            address2


        beforeEach(async function () {
            toastFactory = await ethers.getContractFactory("Toast");
            toast = await toastFactory.deploy();

            nftCollectionFactory = await ethers.getContractFactory("NFT");
            nftCollection = await nftCollectionFactory.deploy();

            nftStakingFactory = await ethers.getContractFactory("NFTStaking");
            nftStaking = await nftStakingFactory.deploy(nftCollection.address, toast.address);

            deployer = (await ethers.getSigner()).address;
            address2 = (await ethers.getSigners())[1].address;
        })

        it("Can mint an NFT", async function () {
            await nftCollection.mint(deployer, 1);
            const ownerOfToken1 = await nftCollection.ownerOf(1);
            assert.equal(ownerOfToken1, deployer);
        });

        it("Can mint more than 100 at a time", async function () {
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




    });
});
