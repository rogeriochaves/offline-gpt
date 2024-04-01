"use client";
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";
import * as webllm from "@mlc-ai/web-llm";
import { ChatAdapter, StreamingAdapterObserver } from "@nlux/core";
import { AiChat } from "@nlux/react";
import "@nlux/themes/nova.css";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Wifi, X } from "react-feather";

const chat = new webllm.ChatModule();
let chatIsReloading = false;

const modelList = [
  {
    model_url: "/models/TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC/",
    model_lib_url:
      "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/TinyLlama-1.1B-Chat-v0.4/TinyLlama-1.1B-Chat-v0.4-q4f16_1-ctx1k-webgpu.wasm",
    local_id: "TinyLlama-1.1B",
  },
];

const webLLMAdapter: ChatAdapter = {
  streamText: async (
    message: string,
    observer: StreamingAdapterObserver,
    { conversationHistory }
  ) => {
    const stream = await chat.chatCompletion({
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...(conversationHistory ?? []).map((message) => ({
          role: (message.role === "ai" ? "assistant" : "user") as
            | "assistant"
            | "user",
          content: message.message,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.5,
    });

    for await (const chunk of stream) {
      observer.next(chunk.choices[0].delta.content ?? "");
    }
    observer.complete();
  },
};

export default function App() {
  const [model, setModel] = useState("TinyLlama-1.1B");
  const [progress, setProgress] = useState<
    | {
        status: "loading";
        progress: number;
        text: string;
      }
    | {
        status: "error";
        error: string;
      }
  >({
    status: "loading",
    progress: 0,
    text: "",
  });
  const [modalOpen, setModalOpen] = useState<
    "intro" | "turn_off_wifi" | undefined
  >("intro");

  useEffect(() => {
    chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
      setProgress({ status: "loading", ...report });
    });

    return () => {
      chat.setInitProgressCallback(() => {});
    };
  }, []);

  useEffect(() => {
    if (chatIsReloading) return;

    chatIsReloading = true;
    void chat.reload(model, undefined, { model_list: modelList }).catch((e) => {
      setProgress({ status: "error", error: e.message });
    });
    setTimeout(() => {
      chatIsReloading = false;
    }, 100);
  }, [model]);

  const isModelReady =
    progress.status == "loading" &&
    progress.progress == 1 &&
    progress.text.includes("Finish ");

  return (
    <>
      <IntroModal
        model={model}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        isModelReady={isModelReady}
        progress={progress}
      />
      <TurnOffWifiModal modalOpen={modalOpen} setModalOpen={setModalOpen} />

      <VStack padding={4} minHeight="100vh" align="center" spacing={4}>
        <HStack width="full" align="start">
          <Heading as="h1" size="xl" marginBottom={4}>
            Offline GPT
          </Heading>
          <Spacer />
          <Link href="#about" fontSize="22px" fontWeight="500" paddingRight={4}>
            About
          </Link>
        </HStack>
        <Spacer />
        <AiChat
          className="custom-ai-chat-comp"
          adapter={webLLMAdapter}
          promptBoxOptions={{
            placeholder: "How can I help you today?",
          }}
        />
        <Box width="full" textAlign="center">
          made with ❤️ by{" "}
          <a href="https://twitter.com/_rchaves_" target="_blank">
            _rchaves_
          </a>
          .{" "}
          <a
            href="https://twitter.com/_rchaves_"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            Follow me
          </a>{" "}
          on twitter.
        </Box>
      </VStack>
      <VStack
        id="about"
        padding={4}
        height="100vh"
        align="start"
        spacing={4}
        maxWidth="800px"
      >
        <Heading as="h1" size="xl" marginBottom={4}>
          About
        </Heading>
        <Text>
          Offline GPT is made possible thanks to the amazing folks at{" "}
          <a
            href="https://webllm.mlc.ai/"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            WebLLM
          </a>
          , a project which brings Local LLMs to the web browser, accelerated
          with WebGPU, and of course, the whole community of open-source LLMs
          and AI enthusiasts.
        </Text>
        <Text>
          Offline GPT downloads a small large language model that stays cached
          in your browser, allowing you to chat with the AI on your local
          machine, even without an internet connection.
        </Text>
        <Text>
          This also means that your <b>privacy</b> is guaranteed, as your
          conversation never leaves your device. What{"'"}s between you and the
          bot, stays between you and the bot.
        </Text>
        <Text>
          If you enjoy the project and are interested in more stuff about LLMs,
          follow me on{" "}
          <a
            href="https://twitter.com/_rchaves_"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            Twitter
          </a>{" "}
          for more updates on it and other cool projects.
        </Text>
      </VStack>
    </>
  );
}

function IntroModal({
  model,
  modalOpen,
  setModalOpen,
  isModelReady,
  progress,
}: {
  model: string;
  modalOpen: "intro" | "turn_off_wifi" | undefined;
  setModalOpen: (modal: "intro" | "turn_off_wifi" | undefined) => void;
  isModelReady: boolean;
  progress:
    | {
        status: "loading";
        progress: number;
        text: string;
      }
    | {
        status: "error";
        error: string;
      };
}) {
  return (
    <Modal size="xxl" isOpen={modalOpen == "intro"} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent maxWidth="800px" marginX={4}>
        <ModalHeader>
          <HStack width="full">
            <Text>Welcome to Offline GPT</Text>
            <Spacer />
            <Text color="gray.400" fontWeight="normal" fontSize="14px">
              {model}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack align="start" spacing={4} paddingBottom={3}>
            <Text>
              Offline GPT runs directly in your browser and do not require an
              internet connection. Your conversation stays on your device and is
              not sent to any servers.
            </Text>
            <Text>
              You can chat with the AI and generate any text you want even in
              airplane mode with total privacy and without having to install an
              app.
            </Text>
            <Text>
              On the first time you open this page, the model will be loaded, it
              may take a few seconds to a few minutes depending on your device,
              but it will be cached for next time.
            </Text>
            <Text>
              After the first load, feel free to hit refresh or close the tab,
              you can come back to offline-gpt.com anytime even without internet
              and it will still work.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack
            align="center"
            flexWrap={["wrap", "wrap", "nowrap", "nowrap"]}
            width="full"
            spacing={4}
          >
            <HStack spacing={4}>
              <Box position="relative">
                <Fade in={isModelReady || progress.status === "error"}>
                  <Box
                    position="absolute"
                    color={
                      progress.status === "error" ? "red.500" : "green.500"
                    }
                    top="13px"
                    left="12px"
                  >
                    {progress.status === "error" ? <X /> : <Check />}
                  </Box>
                </Fade>
                <CircularProgress
                  value={
                    progress.status == "loading"
                      ? Math.min(
                          progress.progress * 100,
                          isModelReady ? 100 : 90
                        )
                      : 100
                  }
                  thickness="16px"
                  color={progress.status === "error" ? "red.500" : "green.500"}
                />
              </Box>
              <VStack align="start" spacing={0}>
                {progress.status == "error" ? (
                  <Text fontWeight="500" color="red.500">
                    Sorry, Offline GPT does not work on your browser
                  </Text>
                ) : !isModelReady ? (
                  <Text fontWeight="500">Loading Model...</Text>
                ) : (
                  <Text fontWeight="500" color="green.600">
                    Model Ready
                  </Text>
                )}
                <Text color="gray.400" fontSize="13px">
                  {progress.status === "error"
                    ? `Please try using Google Chrome on a Mac if possible. Error: ${progress.error}`
                    : progress.text}
                </Text>
              </VStack>
            </HStack>
            <Spacer />
            <Button
              colorScheme="blue"
              onClick={() =>
                setModalOpen(navigator.onLine ? "turn_off_wifi" : undefined)
              }
              isDisabled={!isModelReady}
              rightIcon={<ChevronRight />}
            >
              Next
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function TurnOffWifiModal({
  modalOpen,
  setModalOpen,
}: {
  modalOpen: "intro" | "turn_off_wifi" | undefined;
  setModalOpen: (modal: "intro" | "turn_off_wifi" | undefined) => void;
}) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Modal size="xxl" isOpen={modalOpen == "turn_off_wifi"} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent maxWidth="800px" marginX={4} marginTop="192px">
        <ModalHeader>Turn Off the Wi-Fi</ModalHeader>
        <ModalBody>
          <HStack align="center" spacing={4}>
            <Box color="blue.600">
              <Wifi size={64} />
            </Box>
            <VStack align="start" spacing={1}>
              <Text>
                Now that the model is ready, feel free to turn off your Wi-Fi
                and chat with the AI.
              </Text>
              <HStack spacing={2}>
                <Text fontWeight="500">Wi-Fi Status:</Text>
                <Text
                  fontWeight="500"
                  color={isOnline ? "green.500" : "red.500"}
                >
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Text>Press Next to start chatting.</Text>
          <Spacer />
          <Button
            colorScheme="blue"
            onClick={() => setModalOpen(undefined)}
            rightIcon={<ChevronRight />}
          >
            Next
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
