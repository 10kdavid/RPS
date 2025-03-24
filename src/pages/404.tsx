import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  const router = useRouter();
  const [urlPath, setUrlPath] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');
  
  useEffect(() => {
    // Get the current URL to see if it's a game link
    if (typeof window !== 'undefined') {
      setUrlPath(window.location.href);
      
      const url = window.location.href;
      
      // Check for game links in URLs
      if (url.includes('blackjack') && url.includes('invite=')) {
        // Extract the invite code
        const inviteCode = url.split('invite=')[1]?.split('&')[0];
        
        if (inviteCode) {
          setRedirectMessage(`Redirecting to Blackjack game with invite: ${inviteCode}`);
          
          // Redirect to the correct URL
          setTimeout(() => {
            router.push(`/game/blackjack?invite=${inviteCode}`);
          }, 1500);
        }
      } else if (url.includes('minesweeper') && url.includes('id=')) {
        // Extract the game ID
        const gameId = url.split('id=')[1]?.split('&')[0];
        
        if (gameId) {
          setRedirectMessage(`Redirecting to Minesweeper game with ID: ${gameId}`);
          
          // Redirect to the correct URL
          setTimeout(() => {
            router.push(`/game/minesweeper?id=${gameId}`);
          }, 1500);
        }
      }
    }
  }, [router]);
  
  return (
    <>
      <Head>
        <title>Page Not Found - Rock Paper Solana</title>
        <meta name="description" content="Page not found" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-[#1e293b] p-8 rounded-lg border border-[#334155] text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl mb-6">Page Not Found</h2>
          
          {redirectMessage ? (
            <div className="mb-6 text-[#3b82f6]">{redirectMessage}</div>
          ) : (
            <p className="mb-6 text-gray-300">
              The page you are looking for does not exist or has been moved to another URL.
            </p>
          )}
          
          <div className="space-y-4">
            <Link href="/" className="block w-full bg-[#3b82f6] text-white px-4 py-2 rounded-md hover:bg-[#2563eb]">
              Go back to Home
            </Link>
            
            <div className="text-sm text-gray-400 mt-4">
              <p>Looking to join a game? Make sure you have the correct game link.</p>
              <p className="mt-2">You can also go to our homepage and enter the game ID directly.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 