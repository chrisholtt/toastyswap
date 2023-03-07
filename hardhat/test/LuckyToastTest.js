const {
    time,
    loadFixture,
    mine
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const oneWei = 1000000000000000000;

describe("Lucky Toast", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployToastStakingContract() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Toast = await ethers.getContractFactory("Toast");
        const toast = await Toast.deploy();

        const LuckyToast = await ethers.getContractFactory("LuckyToast");
        const luckyToast = await LuckyToast.deploy(toast.address);

        return { toast, luckyToast, owner, otherAccount };
    }

    describe("Stake functions", function () {
        let toastFactory,
            toast,
            luckyToastFactory,
            luckyToast,
            deployer,
            address2,
            gameNumber,
            signer1ConnectedContractToast,
            signer1ConnectedContractLuckyToast,
            signer2ConnectedContractToast,
            signer2ConnectedContractLuckyToast;


        beforeEach(async function () {
            toastFactory = await ethers.getContractFactory("Toast");
            toast = await toastFactory.deploy();

            luckyToastFactory = await ethers.getContractFactory("LuckyToast");
            luckyToast = await luckyToastFactory.deploy(toast.address);

            deployer = (await ethers.getSigner()).address;
            signers = (await ethers.getSigners())

            await toast.addController(deployer);
            await toast.mint(deployer, 1000);
            await toast.approve(luckyToast.address, 1000000000);
            await toast.addController(luckyToast.address);
            gameNumber = await luckyToast.getGameNumber();

            // Connecting signers and aprroving.
            await toast.transfer(signers[1].address, 100);
            signer1ConnectedContractToast = await toast.connect(signers[1]);
            signer1ConnectedContractLuckyToast = await luckyToast.connect(signers[1]);
            signer1ConnectedContractToast.approve(luckyToast.address, 1000000000);
            // Signer 2
            await toast.transfer(signers[2].address, 100);
            signer2ConnectedContractToast = await toast.connect(signers[2]);
            signer2ConnectedContractLuckyToast = await luckyToast.connect(signers[2]);
            signer2ConnectedContractToast.approve(luckyToast.address, 1000000000);
        })

        it("starts at game 1", async function () {
            assert.equal(gameNumber, 1);
        })

        it("Can enter", async function () {
            await luckyToast.stake(50);
            const entry = await luckyToast.getPlayersStakeInGame(gameNumber, deployer);
            assert.equal(entry.owner, deployer);
            assert.equal(entry.amount, 50);
        });

        it("Can get TVL", async function () {
            await luckyToast.stake(50);
            const entry = await luckyToast.getTVL();
            assert.equal(entry, 50);
        });

        it("Can get accurate start time of game", async function () {
            let startTime1, startTime2
            await luckyToast.stake(50);
            startTime1 = (await luckyToast.games(gameNumber)).startAt;
            await time.increase(3600 * 23); // waiting 23 hours 
            await luckyToast.stake(50);
            startTime2 = (await luckyToast.games(gameNumber)).startAt;
            assert.equal(startTime1.value, startTime2.value); // Start time of games should be the same
        });

        it("Starts a new game when someone stakes after 24 hours of when the game starts", async function () {
            let gameNumber1, gameNumber2
            await luckyToast.stake(10);
            gameNumber1 = await luckyToast.getGameNumber();
            await time.increase(3600 * 24 * 1); // waiting 2 days 
            await luckyToast.stake(10);
            gameNumber2 = await luckyToast.getGameNumber();
            assert.equal(gameNumber1, 1);
            assert.equal(gameNumber2, 2);
        })

        it("Can withdraw stake at anytime", async function () {
            let gameNumber1, tvl, players
            await luckyToast.stake(10);
            await signer1ConnectedContractLuckyToast.stake(10);
            await signer2ConnectedContractLuckyToast.stake(10);
            await luckyToast.stake(10);
            tvl = (await luckyToast.games(1)).tvl
            assert.equal(tvl, 40);
            players = await luckyToast.getPlayers(1)
            // console.log(players);
            assert.equal(players.length, 3);
            signer1ConnectedContractLuckyToast.withdraw(10);
            tvl = (await luckyToast.games(1)).tvl
            assert.equal(tvl, 30);
            players = await luckyToast.getPlayers(1)
            // console.log(players);
            assert.equal(players.length, 2)
        })






    });
});
