import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

// The deployed program ID you provided
const ESCROW_PROGRAM_ID = 'cPmtN4KbNDNaVEuWWKczs7Va12KyDgJnYEhU8r2jfeG';

// Array of fallback RPC endpoints for better reliability
const RPC_ENDPOINTS = [
  'https://api.devnet.solana.com',
  '/api/proxy', // Local proxy to avoid CORS issues
];

// Helper function to get a working connection with fallbacks
async function getWorkingConnection(commitment: 'confirmed' | 'finalized' = 'confirmed'): Promise<Connection> {
  // Try each endpoint
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, commitment);
      // Verify the connection works
      await connection.getVersion();
      console.log(`Connected to ${endpoint}`);
      return connection;
    } catch (error) {
      console.warn(`Failed to connect to ${endpoint}:`, error);
    }
  }
  
  // If we reach here, all connections failed
  console.error("All RPC endpoints failed");
  throw new Error("Cannot connect to Solana RPC. Please try again later.");
}

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

// Initialize the Escrow Service with better error handling
export class EscrowService {
  private connection: Connection | null = null;
  private programId: PublicKey;
  private wallet: any;

  constructor(connection: Connection | null, wallet: any) {
    this.connection = connection;
    this.programId = new PublicKey(ESCROW_PROGRAM_ID);
    this.wallet = wallet;
  }
  
  // Get a connection, creating one if needed
  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await getWorkingConnection();
    }
    return this.connection;
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

  // Create a new escrow for a game with better error reporting
  async createEscrowWallet(gameId: string): Promise<string> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      
      // Get a reliable connection
      const connection = await this.getConnection();
      
      // Create Provider (anchor's wrapper around Connection + Wallet)
      const provider = new anchor.AnchorProvider(
        connection,
        this.wallet,
        { commitment: 'confirmed' }
      );

      // Create a program interface from the IDL
      const program = new anchor.Program(idl as any, this.programId, provider);
      
      // Get the escrow PDA
      const [escrowAddress, bump] = await this.getEscrowAddress(gameId, this.wallet.publicKey);
      
      console.log("Creating escrow at address:", escrowAddress.toString());
      
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
      
      return escrowAddress.toString();
    } catch (error) {
      console.error("Error creating escrow:", error);
      if (error.message?.includes("Transaction simulation failed")) {
        throw new Error("Transaction failed. You might need Solana devnet SOL.");
      }
      throw error;
    }
  }

  // Send funds to the escrow with better error messages
  async sendToEscrow(gameId: string, escrowAddress: string, amount: number): Promise<any> {
    try {
      if (!this.wallet.publicKey) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }
      
      // Get a reliable connection
      const connection = await this.getConnection();
      
      // Check wallet balance first
      const balance = await connection.getBalance(this.wallet.publicKey);
      const lamports = amount * anchor.web3.LAMPORTS_PER_SOL;
      
      if (balance < lamports + 5000) { // Add buffer for transaction fee
        throw new Error(`Insufficient balance. You need at least ${amount + 0.000005} SOL.`);
      }
      
      const provider = new anchor.AnchorProvider(
        connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new anchor.Program(idl as any, this.programId, provider);
      
      console.log(`Sending ${amount} SOL (${lamports} lamports) to escrow ${escrowAddress}`);
      
      // Call the deposit instruction
      const tx = await program.methods
        .deposit(gameId, new anchor.BN(lamports))
        .accounts({
          player: this.wallet.publicKey,
          escrow: new PublicKey(escrowAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Deposit transaction:", tx);
      
      // Return more detailed success info
      return { 
        success: true, 
        signature: tx,
        amount: amount,
        escrowAddress: escrowAddress
      };
    } catch (error) {
      console.error("Error sending to escrow:", error);
      
      // Provide better error messages
      if (error.message?.includes("0x1")) {
        throw new Error("Transaction failed. Make sure you have enough SOL on devnet.");
      } else if (error.message?.includes("not match constraint")) {
        throw new Error("Game ID doesn't match the escrow. Please check your game link.");
      }
      
      throw error;
    }
  }

  // Join an existing escrow as player 2
  async joinEscrow(gameId: string, escrowAddress: string): Promise<any> {
    try {
      const provider = new anchor.AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new anchor.Program(idl as any, this.programId, provider);
      
      console.log(`Joining escrow for game ${gameId} at address ${escrowAddress}`);
      
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
      const provider = new anchor.AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new anchor.Program(idl as any, this.programId, provider);
      
      console.log(`Setting winner ${winnerAddress} for game ${gameId}`);
      
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
      
      const provider = new anchor.AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new anchor.Program(idl as any, this.programId, provider);
      
      console.log(`Claiming funds for game ${gameId} as ${winnerAddress}`);
      
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
      return balance / anchor.web3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting escrow balance:", error);
      throw error;
    }
  }

  // Get the full state of an escrow
  async getEscrowState(gameId: string, creator: PublicKey): Promise<any> {
    try {
      const provider = new anchor.AnchorProvider(
        this.connection,
        this.wallet,
        { commitment: 'confirmed' }
      );
      
      const program = new anchor.Program(idl as any, this.programId, provider);
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
  
  // We'll get the connection later, so passing null initially
  const escrowService = new EscrowService(null, wallet);
  
  // Return all the methods from the service
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