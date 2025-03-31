import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

// The deployed program ID you provided
const ESCROW_PROGRAM_ID = 'cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG';

// IDL (Interface Definition Language) for our program
// This would typically be generated when you build your Anchor program
const idl = {
  "version": "0.1.0",
  "name": "minesweeper_escrow",
  "instructions": [
    {
      "name": "initializeEscrow",
      "accounts": [
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "escrow", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "string" }
      ]
    },
    {
      "name": "joinEscrow",
      "accounts": [
        { "name": "player", "isMut": true, "isSigner": true },
        { "name": "escrow", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "string" }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        { "name": "player", "isMut": true, "isSigner": true },
        { "name": "escrow", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "string" },
        { "name": "amount", "type": "u64" }
      ]
    },
    {
      "name": "setWinner",
      "accounts": [
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "escrow", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "string" },
        { "name": "winner", "type": "publicKey" }
      ]
    },
    {
      "name": "claimFunds",
      "accounts": [
        { "name": "claimer", "isMut": true, "isSigner": true },
        { "name": "escrow", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "string" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Escrow",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "creator", "type": "publicKey" },
          { "name": "gameId", "type": "string" },
          { "name": "player1", "type": "publicKey" },
          { "name": "player2", "type": "publicKey" },
          { "name": "player1Deposited", "type": "bool" },
          { "name": "player2Deposited", "type": "bool" },
          { "name": "amount1", "type": "u64" },
          { "name": "amount2", "type": "u64" },
          { "name": "winner", "type": { "option": "publicKey" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "GameIdTooLong", "msg": "Game ID too long (max 32 characters)" },
    { "code": 6001, "name": "GameIdMismatch", "msg": "Game ID mismatch" },
    { "code": 6002, "name": "PlayerAlreadyJoined", "msg": "Player has already joined this game" },
    { "code": 6003, "name": "AlreadyDeposited", "msg": "Player has already deposited funds" },
    { "code": 6004, "name": "Player1NotDeposited", "msg": "First player has not deposited yet" },
    { "code": 6005, "name": "AmountMismatch", "msg": "Deposit amount must match player1's deposit" },
    { "code": 6006, "name": "UnauthorizedPlayer", "msg": "Unauthorized player" },
    { "code": 6007, "name": "Unauthorized", "msg": "Unauthorized action" },
    { "code": 6008, "name": "PlayersNotDeposited", "msg": "Both players must deposit before setting winner" },
    { "code": 6009, "name": "InvalidWinner", "msg": "Winner must be one of the players" },
    { "code": 6010, "name": "WinnerNotSet", "msg": "Winner has not been set" },
    { "code": 6011, "name": "NotWinner", "msg": "Only the winner can claim funds" },
    { "code": 6012, "name": "CalculationError", "msg": "Calculation error" },
    { "code": 6013, "name": "InsufficientFunds", "msg": "Insufficient funds" }
  ]
};

// Initialize the Escrow Service
export class EscrowService {
  private connection: Connection;
  private programId: PublicKey;
  private wallet: any;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.programId = new PublicKey(ESCROW_PROGRAM_ID);
    this.wallet = wallet;
  }

  // Helper function to get the escrow account address
  private async getEscrowAddress(gameId: string, creator: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from('escrow'),
        Buffer.from(gameId),
        creator.toBuffer()
      ],
      this.programId
    );
  }

  // Create a new escrow for a game
  async createEscrowWallet(gameId: string): Promise<string> {
    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );

      const program = new Program(idl as any, this.programId, provider);
      
      // Get the escrow PDA
      const [escrowAddress, bump] = await this.getEscrowAddress(gameId, this.wallet.publicKey);
      
      // Call the initialize_escrow instruction
      const tx = await program.methods
        .initializeEscrow(gameId)
        .accounts({
          creator: this.wallet.publicKey,
          escrow: escrowAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Escrow created with transaction:", tx);
      console.log("Escrow address:", escrowAddress.toString());
      
      return escrowAddress.toString();
    } catch (error) {
      console.error("Error creating escrow:", error);
      throw error;
    }
  }

  // Send funds to the escrow
  async sendToEscrow(gameId: string, escrowAddress: string, amount: number): Promise<any> {
    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new Program(idl as any, this.programId, provider);
      
      // Convert SOL to lamports
      const lamports = amount * web3.LAMPORTS_PER_SOL;
      
      // Call the deposit instruction
      const tx = await program.methods
        .deposit(gameId, new BN(lamports))
        .accounts({
          player: this.wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Deposit transaction:", tx);
      return { 
        success: true, 
        signature: tx 
      };
    } catch (error) {
      console.error("Error sending to escrow:", error);
      throw error;
    }
  }

  // Join an existing escrow as player 2
  async joinEscrow(gameId: string, escrowAddress: string): Promise<any> {
    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new Program(idl as any, this.programId, provider);
      
      // Call the join_escrow instruction
      const tx = await program.methods
        .joinEscrow(gameId)
        .accounts({
          player: this.wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Join escrow transaction:", tx);
      return { 
        success: true, 
        signature: tx 
      };
    } catch (error) {
      console.error("Error joining escrow:", error);
      throw error;
    }
  }

  // Set the winner of the game
  async setWinner(gameId: string, escrowAddress: string, winnerAddress: string): Promise<any> {
    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new Program(idl as any, this.programId, provider);
      
      // Call the set_winner instruction
      const tx = await program.methods
        .setWinner(gameId, new PublicKey(winnerAddress))
        .accounts({
          creator: this.wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Set winner transaction:", tx);
      return { 
        success: true, 
        signature: tx 
      };
    } catch (error) {
      console.error("Error setting winner:", error);
      throw error;
    }
  }

  // Claim funds as the winner
  async releaseEscrow(gameId: string, escrowAddress: string, winnerAddress: string): Promise<any> {
    try {
      // Ensure the claimer is the winner
      if (winnerAddress !== this.wallet.publicKey.toString()) {
        throw new Error("Only the winner can claim funds");
      }
      
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new Program(idl as any, this.programId, provider);
      
      // Call the claim_funds instruction
      const tx = await program.methods
        .claimFunds(gameId)
        .accounts({
          claimer: this.wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Claim funds transaction:", tx);
      return { 
        success: true, 
        signature: tx 
      };
    } catch (error) {
      console.error("Error claiming funds:", error);
      throw error;
    }
  }

  // Get the balance of an escrow
  async getEscrowBalance(escrowAddress: string): Promise<number> {
    try {
      const balance = await this.connection.getBalance(new PublicKey(escrowAddress));
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting escrow balance:", error);
      throw error;
    }
  }

  // Get the full state of an escrow
  async getEscrowState(gameId: string, creator: PublicKey): Promise<any> {
    try {
      const provider = new AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new Program(idl as any, this.programId, provider);
      const [escrowAddress] = await this.getEscrowAddress(gameId, creator);
      
      return await program.account.escrow.fetch(escrowAddress);
    } catch (error) {
      console.error("Error fetching escrow state:", error);
      throw error;
    }
  }
}

// Hook to use the escrow service in React components
export function useEscrowService() {
  const wallet = useWallet();
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
  
  const escrowService = new EscrowService(connection, wallet);
  
  return {
    createEscrowWallet: escrowService.createEscrowWallet.bind(escrowService),
    sendToEscrow: escrowService.sendToEscrow.bind(escrowService),
    joinEscrow: escrowService.joinEscrow.bind(escrowService),
    setWinner: escrowService.setWinner.bind(escrowService),
    releaseEscrow: escrowService.releaseEscrow.bind(escrowService),
    getEscrowBalance: escrowService.getEscrowBalance.bind(escrowService),
    getEscrowState: escrowService.getEscrowState.bind(escrowService)
  };
} 