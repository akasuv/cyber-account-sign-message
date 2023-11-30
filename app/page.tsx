"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  useSignMessage,
  useAccount,
  useConnect,
  useSendTransaction,
  useContractRead,
  useSwitchNetwork,
  useNetwork,
  useSignTypedData,
} from "wagmi";
import { parseUnits, hashMessage } from "viem";
import { ERC1271ABI } from "@/lib/ERC1271";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const { chain } = useNetwork();
  const { signTypedDataAsync } = useSignTypedData();

  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const {
    data,
    isLoading: isSending,
    isSuccess: isSendingSuccess,
    sendTransaction,
  } = useSendTransaction({
    to: address,
    value: parseUnits("0.000001", 18),
  });
  const [inputValue, setInputValue] = useState("");
  const [confirmedValue, setConfirmedValue] = useState("");
  const [message, setMessage] = useState("");
  const [messageForVerification, setMessageForVerification] = useState("");

  const {
    data: signature,
    isError,
    isLoading: isSigning,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message,
  });

  const {
    data: isValidSignature,
    refetch,
    isRefetching: isVerifying,
    isLoading: isVerifyingLoading,
  } = useContractRead({
    address: address,
    abi: ERC1271ABI,
    functionName: "isValidSignature",
    args: [hashMessage(messageForVerification), inputValue],
    enabled: !!(messageForVerification && inputValue),
    onError: (err) => {
      alert(err);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (id: string) => {
    switchNetwork?.(Number(id));
  };

  const handleSign = async () => {
    // All properties on a domain are optional
    const domain = {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    } as const;

    // The named list of all type definitions
    const types = {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    } as const;

    const message = {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    } as const;

    const primaryType = "Mail";

    const signature = await signTypedDataAsync({
      domain,
      types,
      primaryType,
      message,
    });

    console.log({ signature });
  };

  return mounted ? (
    <main className="flex min-h-screen flex-col items-center border pt-16">
      <h1 className="text-xl font-bold">CyberAccount Sign Message Demo</h1>
      <div className="mt-8 w-[920px]">
        <div className="w-[200px]">
          <Label className="font-bold">Network</Label>
          <Select value={String(chain?.id)} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Switch network" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={String(chain.id)}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-x-4">
        <div className="mt-8 p-8 flex flex-col gap-y-2 border rounded w-[500px]">
          <h2 className="text-lg font-bold">Sign Message</h2>
          <Label className="font-bold mt-4">CyberAccount address</Label>
          <p>{address}</p>
          <Label className="font-bold mt-4">Message</Label>
          <Input
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Label htmlFor="signature" className="font-bold mt-4">
            Signature
          </Label>
          {signature ? (
            <p className="break-words">{signature}</p>
          ) : (
            <p>Please sign the message first</p>
          )}
          {isConnected ? (
            <div className="flex gap-x-4 w-full mt-4">
              <Button
                className="grow"
                onClick={() => handleSign()}
                disabled={isSigning}
              >
                {isSigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign
              </Button>
            </div>
          ) : (
            <Button className="mt-4" onClick={() => connect()}>
              Connect Wallet
            </Button>
          )}
        </div>
        <div className="mt-8 p-8 flex flex-col gap-y-2 border rounded w-[400px]">
          <h2 className="text-lg font-bold">Validate Signature</h2>
          <Label className="font-bold mt-4">Message</Label>
          <Input
            placeholder="Enter message"
            value={messageForVerification}
            onChange={(e) => setMessageForVerification(e.target.value)}
          />
          <Label htmlFor="signature" className="font-bold mt-4">
            Validate Signature
          </Label>
          <Input
            placeholder="Enter signature"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {
            <p>
              {isVerifying || isVerifyingLoading ? (
                "Verifying..."
              ) : isValidSignature === undefined ? null : isValidSignature ===
                "0x1626ba7e" ? (
                <p>
                  Is valid signature:
                  <span className="ml-2 text-green-500">True</span>
                </p>
              ) : (
                <p>
                  Is valid signature:
                  <span className="ml-2 text-red-500">False</span>
                </p>
              )}
            </p>
          }
        </div>
      </div>
    </main>
  ) : null;
}
