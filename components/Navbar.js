// Navbar.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as fcl from '@onflow/fcl';
import useStore from '../store/store';

export default function Navbar() {
  const router = useRouter();
  const store = useStore();
  const currentAccount = store.currentAccount;

  useEffect(() => {
    fcl.currentUser().subscribe((user) => {
      if (user.loggedIn) {
        const address = user.addr;
        store.setCurrentAccount(address);
      }
    });
  }, []);

  const handleConnectWallet = async () => {
    try {
      await fcl.authenticate();
      const currentUser = await fcl.currentUser();
      const address = currentUser.addr;
      store.setCurrentAccount(address);
      router.push('/home');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fcl.unauthenticate();
      store.setCurrentAccount('');
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      <div className="text-white flex h-16 sticky top-0 z-10 w-full bg-black flex-row justify-between items-center px-6">
        <div className="h-28 w-28">
          <img src="/Assets/Chainshots.svg" alt="" />
        </div>
        <div>
          <input
            className="w-96 bg-[#2d2d2d] px-8 py-2 border-none rounded-md outline-1 outline-purple-500"
            placeholder="Search what you want to see?"
          ></input>
        </div>
        <div className="flex gap-4">
          {currentAccount ? (
            <>
              <button
                className="border-2 px-4 py-1 rounded-md hover:border-purple-500 hover:text-purple-500 transition-all hover:bg-slate-800 hover:scale-105"
                onClick={() => {
                  router.push('/upload');
                }}
              >
                Upload
              </button>
              <button
                className="border-2 px-4 py-1 rounded-md hover:border-purple-500 hover:text-purple-500 transition-all hover:bg-slate-800 hover:scale-105"
                onClick={handleLogout}
              >
                <span>{currentAccount}</span>
              </button>
            </>
          ) : (
            <button
              className="border-2 px-4 py-1 rounded-md hover:border-purple-500 hover:text-purple-500 transition-all hover:bg-slate-800 hover:scale-105"
              onClick={handleConnectWallet}
            >
              <span>Connect wallet</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
