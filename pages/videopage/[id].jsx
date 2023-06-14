import React, { useEffect } from "react";
import { useRouter } from "next/router";
import useStore from "../../store/store";
import Player from "../../components/Videoplay";
import Video from "../../components/RelatedVideo";
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

import { useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import flowConfig from "./flow.config"; // Import the Flow configuration

// Import the Flow transaction code
import flowTransactionCode from "../../cadence/transaction/tip_script.cdc";

export async function getServerSideProps() {
  return {
    props: {},
  };
}

fcl.config()
  .put('accessNode.api', flowConfig.accessNodeApi)
  .put('discovery.wallet', flowConfig.discoveryWallet);


  const sendQuery = async () => {
    const profile = await fcl.query({
      cadence: `
        import Profile from 0xProfile

        pub fun main(address: Address): Profile.ReadOnly? {
          return Profile.read(address)
        }
      `,
      args: (arg, t) => [arg(user.addr, t.Address)]
    })

    setName(profile?.name ?? 'No Profile')
  }

export default function id() {
  const store = useStore();
  const allVideos = store.allVideos;
  const router = useRouter();
  const id = router.query;
  const currentVideo = allVideos[id?.id];
  const [loading, setLoading] = useState(false);

  const sendTip = async () => {
    const sendToast = toast.loading("Please Sign Message");
    try {
      const currentUser = await fcl.authenticate();

      // Create a new transaction using the Flow contract
      const transactionId = await fcl.mutate({
        cadence: `
        import HelloWorld from 0x01

        transaction {

        prepare(acct: AuthAccount) {}

      execute {
          log("Thanks for Tip")
      }
      }

        
        `,
        args: (arg, t) => [
          // Provide any required arguments for the tip function
          // You can replace the argument placeholder with the actual value
          arg("ArgumentValue", t.ArgumentType),
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50
      });

      toast.update(sendToast, {
        render: "Sending Tip",
        type: "default",
        isLoading: true,
      });

      // Wait for the transaction to be confirmed
      await fcl.tx(transactionId).onceSealed();

      toast.update(sendToast, {
        render: "Tip Sent",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    } catch (error) {
      const currentUser = await fcl.authenticate();

      // Create a new transaction using the Flow contract
      const transactionId = await fcl.mutate({
        cadence: `
        import HelloWorld from 0xc15bf66e09ac1754

transaction {

  prepare(acct: AuthAccount) {}

  execute {
    log("Thanks for Tip")
  }
}

        
        `,
        args: [
          fcl.arg("0xc15bf66e09ac1754", t.Address), // Replace with the recipient address
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 50
      });

      toast.update(sendToast, {
        render: "Sending Tip",
        type: "default",
        isLoading: true,
      });

      // Wait for the transaction to be confirmed
      await fcl.tx(transactionId).onceSealed();

      toast.update(sendToast, {
        render: "Tip Sent",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="w-full h-screen flex flex-row">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col m-10 justify-between lg:flex-row">
            <div className="lg:w-4/6 w-6/6">
              <Player hash={currentVideo?.hash} />
              <div className="my-2 text-3xl text-white flex flex-row justify-between items-center">
                <h1>{currentVideo?.title}</h1>
                <button
                  onClick={sendTip}
                  className="text-2xl border-2 px-4 py-1 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-all hover:bg-slate-800 hover:scale-x-105"
                >
                  Tip the owner
                </button>
              </div>
              <div>
                <div className="text-white text-xl">
                  {currentVideo?.description}
                </div>
              </div>
              <div>
                <div className="text-white text-xl">
                  Uploaded by {currentVideo?.author}
                </div>
              </div>
              <div className="my-8">
                <input
                  className="w-full bg-[#1a1a1a] px-4 py-2 rounded-3xl border-none outline-1 outline-offset-2 outline-purple-400 text-white"
                  type="text"
                  placeholder="Share your thoughts"
                />
              </div>
            </div>
            <div className="w-2/6 h-full max-h-full overflow-y-visible">
              <h4 className="text-md font-bold text-white ml-5 mb-3">
                Related Videos
              </h4>
              {allVideos.map((video, index) => {
                if (index !== id.id) {
                  return <Video horizontal={true} video={video} id={index} />;
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
