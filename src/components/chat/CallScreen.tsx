import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import type { User } from "@/data/mockData";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CallScreenProps {
  user: User; // Remote user
  type: "voice" | "video";
  incoming?: boolean;
  offer?: RTCSessionDescriptionInit;
  onEnd: () => void;
  onReject?: () => void;
}

export default function CallScreen({ user: remoteUser, type, incoming, offer, onEnd, onReject }: CallScreenProps) {
  const { user: currentUser } = useAuth();
  const [callState, setCallState] = useState<"ringing" | "connecting" | "connected" | "ended">(incoming ? "ringing" : "connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize call if outgoing, or wait for answer
  useEffect(() => {
    if (!currentUser) return;

    const setupMediaAndWebRTC = async () => {
      try {
        // 1. Get local media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current && type === "video") {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Setup RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        // Add local tracks to PC
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Listen for remote tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", { to: remoteUser.id, candidate: event.candidate });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setCallState("connected");
          if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            handleEndCall(false);
          }
        };

        // 3. Signaling logic
        if (!incoming) {
          // I am caller
          const newOffer = await pc.createOffer();
          await pc.setLocalDescription(newOffer);
          socket.emit("call_request", {
            to: remoteUser.id,
            from: currentUser.id,
            fromName: currentUser.name,
            callType: type,
            offer: newOffer,
          });
        }
      } catch (err) {
        toast.error("Could not access camera/microphone");
        handleEndCall(false);
      }
    };

    if (!incoming) {
      setupMediaAndWebRTC();
    }

    // Socket listeners
    const handleAnswer = async ({ answer }: any) => {
      if (pcRef.current && pcRef.current.signalingState !== "closed") {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate }: any) => {
      if (pcRef.current && pcRef.current.signalingState !== "closed" && pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
    };

    const handleCallRejected = () => {
      toast.error("Call was declined.");
      handleEndCall(false);
    };

    const handleCallEnded = () => {
      handleEndCall(false);
    };

    socket.on("call_answer", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);

    return () => {
      socket.off("call_answer", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
    };
  }, [incoming, currentUser, remoteUser.id, type]);

  // Handle incoming accept
  const handleAccept = async () => {
    setCallState("connecting");
    if (!pcRef.current && offer) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video",
          audio: true,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current && type === "video") {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", { to: remoteUser.id, candidate: event.candidate });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setCallState("connected");
          if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
            handleEndCall(false);
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call_answer", { to: remoteUser.id, answer });
      } catch (err) {
        toast.error("Could not answer call. Check permissions.");
        handleEndCall(true);
      }
    }
  };

  const handleEndCall = (emitEnd = true) => {
    setCallState("ended");
    if (emitEnd) {
      socket.emit(callState === "ringing" ? "call_rejected" : "call_ended", { to: remoteUser.id });
    }
    
    // Cleanup WebRTC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    setTimeout(() => {
      if (callState === "ringing" && onReject) onReject();
      else onEnd();
    }, 800);
  };

  // Timer
  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Toggle Mute
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !isMuted);
    }
  }, [isMuted]);

  // Toggle Video
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !isCameraOff);
    }
  }, [isCameraOff]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col animate-fade-in",
      type === "video" ? "bg-black" : "bg-gradient-to-b from-[hsl(20,20%,8%)] to-[hsl(20,20%,4%)]"
    )}>
      {/* Remote Video Background (Video Call) */}
      {type === "video" && callState === "connected" && (
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      )}

      {/* Fallback backgrounds if video is off or connecting */}
      {type === "video" && callState !== "connected" && (
        <div className="absolute inset-0 overflow-hidden">
          {remoteUser.profilePicture ? (
            <img src={remoteUser.profilePicture} alt="" className="w-full h-full object-cover opacity-30 blur-2xl scale-125" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-900 to-stone-950" />
          )}
        </div>
      )}

      {/* Local Video Picture-in-Picture */}
      {type === "video" && (callState === "connected" || !incoming) && !isCameraOff && (
        <div className="absolute top-20 right-6 z-20 w-28 h-40 md:w-40 md:h-56 rounded-2xl bg-stone-800 border-2 border-white/20 overflow-hidden shadow-2xl transition-all">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-4 shrink-0 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={() => handleEndCall(true)} className="p-2.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition-all">
          <X className="h-5 w-5" />
        </button>
        {callState === "connected" && (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-sm font-medium tabular-nums shadow-sm">{formatDuration(duration)}</span>
          </div>
        )}
        <div className="w-10" />
      </div>

      {/* Center Profile & Status Info */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8 pointer-events-none">
        {(!type.includes("video") || callState !== "connected") && (
          <>
            <div className={cn("transition-all duration-700", callState === "ringing" && "animate-pulse")}>
              {remoteUser.profilePicture ? (
                <img src={remoteUser.profilePicture} alt={remoteUser.name} className="h-32 w-32 rounded-full object-cover border-4 border-white/20 shadow-2xl" />
              ) : (
                <UserAvatar name={remoteUser.name} size="xl" />
              )}
            </div>
            <div className="text-center space-y-2 drop-shadow-md">
              <h2 className="text-3xl font-bold text-white tracking-tight">{remoteUser.name}</h2>
              <p className={cn(
                "text-base font-medium transition-all drop-shadow-md",
                callState === "ringing" ? "text-white/70 animate-pulse" : 
                callState === "connecting" ? "text-amber-300 animate-pulse" :
                callState === "ended" ? "text-red-400" :
                "text-emerald-400"
              )}>
                {callState === "ringing" && incoming ? (type === "voice" ? "Incoming Voice Call…" : "Incoming Video Call…") :
                 callState === "ringing" || callState === "connecting" ? "Connecting…" :
                 callState === "connected" ? (type === "voice" ? formatDuration(duration) : "") :
                 "Call Ended"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 px-8 pb-16 shrink-0 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-6">
          {callState === "ringing" && incoming ? (
            // Incoming call controls
            <>
              <button
                onClick={() => handleEndCall(true)}
                className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center shadow-lg active:scale-95 transition-all outline-none ring-offset-black focus:ring-2 ring-destructive"
              >
                <PhoneOff className="h-7 w-7 text-white" />
              </button>
              <button
                onClick={handleAccept}
                className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-all outline-none ring-offset-black focus:ring-2 ring-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"
              >
                <Phone className="h-7 w-7 text-white animate-[bounce_1s_infinite]" />
              </button>
            </>
          ) : (
            // In-call / Outgoing controls
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95",
                  isMuted ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                )}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={() => handleEndCall(true)}
                className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center shadow-xl shadow-destructive/30 active:scale-95 transition-all outline-none hover:bg-red-600"
              >
                <PhoneOff className="h-7 w-7 text-white" />
              </button>

              {type === "video" ? (
                <button
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95",
                    isCameraOff ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                  )}
                >
                  {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
              ) : (
                <button
                  className="h-14 w-14 rounded-full flex items-center justify-center bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-all active:scale-95"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
