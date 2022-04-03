import { useState, useEffect } from "react";
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";

const collectionAddress = "0xD5bAD0df8B7449cF6dbE7a83ed55d666a08a63dd";

export default function Home() {
  const address = useAddress();
  const disconnect = useDisconnect();
  const connectWithMetamask = useMetamask();

  const nftDrop = useNFTDrop(collectionAddress);

  const [claimed, setClaimed] = useState(0);
  const [princeInEth, setPriceInEth] = useState();
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(false);

  const onConnectClick = () => {
    address ? disconnect() : connectWithMetamask();
  };

  useEffect(() => {
    if (!nftDrop) return;

    const fetchPrice = async () => {
      const claimedConditions = await nftDrop.claimConditions.getAll();
      setPriceInEth(claimedConditions?.[0].currencyMetadata.displayValue);
    };

    fetchPrice();
  }, [nftDrop]);

  useEffect(() => {
    if (!nftDrop) return;

    const fetchNFTDropData = async () => {
      setLoading(true);
      const claimed = await nftDrop.getAllClaimed();
      const total = await nftDrop.totalSupply();
      setClaimed(claimed.length);
      setTotalSupply(total);
      setLoading(false);
    };
    fetchNFTDropData();
  }, [nftDrop]);

  const mintNft = () => {
    if (!nftDrop || !address) return;

    const quantity = 1;

    setLoading(true);

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = tx[0].receipt;
        const claimedTokenId = tx[0].id;
        const claimedNft = await tx[0].data();

        console.log("receipt", receipt);
        console.log("claimedTokenId", claimedTokenId);
        console.log("claimedNft", claimedNft);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="h-screen flex flex-col lg:grid lg:grid-cols-10">
      {/* left */}
      <div className="lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img className="w-44 rounded-xl object-cover lg:h-96 lg:w-72" src="/azuki.png" alt="" />
          </div>
          <div className="text-center p-5 space-y-2">
            <h1 className="text-4xl font-bold text-white">Azuki</h1>
            <h2 className="text-gray-300 text-xl">A collection of Azuki who lives & breathe React!</h2>
          </div>
        </div>
      </div>
      {/* right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
            The <span className="font-extrabold underline decoration-pink-600/50">AZUKI</span> NFT Market Place
          </h1>
          <button className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base" onClick={onConnectClick}>
            {address ? "Disconnect" : "Connect"}
          </button>
        </header>

        <hr className="my-2 border" />
        {address && (
          <p className="text-sm text-center text-rose-400">
            You are logged in with wallet {address.substring(0, 5)}...{address.substring(address.length - 5)}
          </p>
        )}

        {/* content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
          <img className="w-80 object-cover pb-10 lg:h-40" src="/Azuki-wall.jpeg" alt="" />
          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">The Azuki coding club | NFT Drop</h1>
          {loading ? (
            <p className="pt-2 text-xl text-green-500 animate-bounce">Fetching total supply...</p>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {claimed} / {totalSupply.toString()} of NFTs Minted
            </p>
          )}

          {loading && <img className="w-[200px] h-[200px] object-contain" src="https://cdn.dribbble.com/users/563824/screenshots/3633228/media/b620ccb3ae8c14ea5447d159ebb1da58.gif" />}
        </div>

        {/* mint button */}
        <button onClick={mintNft} disabled={loading || claimed === Number(totalSupply) || !address} className="h-[42px] mt-10 w-full rounded-full bg-red-600 text-white font-bold disabled:bg-gray-400">
          {loading ? <>Loading...</> : claimed === Number(totalSupply) ? <>SOLD OUT</> : !address ? <>Connect wallet to Mint</> : <span>Mint NFT ({princeInEth} ETH)</span>}
        </button>
      </div>
    </div>
  );
}
