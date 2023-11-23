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
} from "wagmi";
import { parseUnits, hashMessage } from "viem";
import { ERC1271ABI } from "@/lib/ERC1271";

export default function Home() {
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

  const {
    data: signature,
    isError,
    isLoading: isSigning,
    isSuccess,
    signMessage,
  } = useSignMessage({
    message: "Hello world",
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
    args: [hashMessage("Hello world"), confirmedValue],
    enabled: false,
    structuralSharing: false,
    staleTime: 0,
    onError: (err) => {
      alert(err);
    },
  });

  console.log({ isValidSignature });

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <main className="flex min-h-screen flex-col items-center border pt-16">
      <h1 className="text-xl font-bold">CyberAccount Sign Message Demo</h1>
      <div className="mt-8 p-8 flex flex-col gap-y-2 border rounded w-[500px]">
        <div className="w-full"></div>
        <Label className="font-bold mt-4">CyberAccount address</Label>
        <p>{address}</p>
        <Label className="font-bold mt-4">Message</Label>
        <p>Hello world</p>
        <Label htmlFor="signature" className="font-bold mt-4">
          Signature
        </Label>
        {signature ? (
          <p className="break-words">{signature}</p>
        ) : (
          <p>Please sign the message first</p>
        )}
        <Label htmlFor="signature" className="font-bold mt-4">
          Validate Signature
        </Label>
        <Input
          placeholder="Copy the signature above"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {
          <p>
            {isValidSignature === undefined ? null : isValidSignature ===
              "0x1626ba7e" ? (
              <span className="text-green-500">True</span>
            ) : (
              <span className="text-red-500">False</span>
            )}
          </p>
        }
        {isConnected ? (
          <div className="flex gap-x-4 w-full mt-4">
            <Button
              className="grow"
              onClick={() => signMessage()}
              disabled={isSigning}
            >
              {isSigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign
            </Button>
            <Button
              className="grow"
              disabled={!signature || isVerifying || isVerifyingLoading}
              onClick={() => {
                setConfirmedValue(inputValue);
                refetch();
              }}
            >
              {(isVerifying || isVerifyingLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </div>
        ) : (
          <Button className="mt-4" onClick={() => connect()}>
            Connect Wallet
          </Button>
        )}
      </div>
    </main>
  ) : null;
}
