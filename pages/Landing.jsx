// Landing.jsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as fcl from '@onflow/fcl';
import useStore from '../store/store';

function Landing() {
  const router = useRouter();
  const store = useStore();

  useEffect(() => {
    fcl.config()
    .put('accessNode.api', 'https://access-testnet.onflow.org')
    .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
    .put('app.detail.title', 'ChainShots')
    .put('app.detail.icon', 'https://res.cloudinary.com/dyk5s8gbw/image/upload/v1686740088/Chainshots_sugv6p.png');

    fcl.currentUser().subscribe((user) => {
      if (user.loggedIn) {
        const address = user.addr;
        store.setCurrentAccount(address);
        router.push('/home');
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

  return (
    <>
      <section className="relative bg-black flex flex-col h-screen justify-center items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="text-center pb-12 md:pb-16">
              <h1
                className="text-5xl text-white md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4"
                data-aos="zoom-y-out"
              >
                Welcome to{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                  ChainShots
                </span>
              </h1>
              <div className="max-w-4xl mx-auto">
                <p
                  className="text-xl text-purple-100 mb-8 text-justify"
                  data-aos="zoom-y-out"
                  data-aos-delay="150"
                >
                  ChainShots built on top of Flow and ChainLink, using the power of
                  Space and Time and leveraging the Storage By Web3 Storage
                  users to create, share and watch videos, without worrying
                  about their privacy.
                </p>
                <div className="flex flex-row gap-8 justify-center my-4 text-purple-400 items-center text-2xl">
                  Build With:
                  <img src="/Assets/flow.svg" className="w-8" alt="Flow" />
                  <img src="/Assets/filecoin.svg" className="w-8" alt="Filecoin" />
                  <img src="/Assets/chainlink.svg" className="w-8" alt="ChainLink" />
                  <img src="/Assets/time_space.jpg" className="w-8" alt="Time and Space" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
