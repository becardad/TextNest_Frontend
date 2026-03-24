export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  bio?: string;
  phone?: string;
  profilePicture?: string;
  favorites?: string[];
  archived?: string[];
  pinned?: string[];
  chatBackgrounds?: Record<string, string>;
  admin?: string;
  settings?: {
    theme: 'light' | 'dark';
    textSize: number;
    disappearTime: number;
  };
}

export type MessageType = "text" | "image" | "voice" | "system" | "video" | "document" | "view-once";

export interface Reaction {
  emoji: string;
  count: number;
  byMe: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  type?: MessageType;
  replyTo?: { name: string; text: string };
  reactions?: Reaction[];
  imageUrl?: string;
  voiceDuration?: string;
  viewOnce?: boolean;
  viewed?: boolean;
  deleted?: boolean;
  fileName?: string;
  fileSize?: string;
  isForwarded?: boolean;
  starredBy?: string[];
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  items: StatusItem[];
  timestamp: string;
  seen: boolean;
}

export interface StatusItem {
  id: string;
  type: "text" | "image";
  content: string;
  backgroundColor?: string;
  timestamp: string;
  caption?: string;
}

export interface Chat {
  user: User;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
}

const ME = "me";

export const currentUser: User = {
  id: ME,
  name: "You",
  avatar: "",
  online: true,
  bio: "Building something amazing ✨",
  phone: "+1 234 567 8900",
  profilePicture: "",
};

export const mockChats: Chat[] = [
  {
    user: {
      id: "1",
      name: "Sarah Mitchell",
      avatar: "",
      online: true,
      bio: "Product Designer @ Figma",
      phone: "+1 555 123 4567",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "That sounds like a great plan! 🎉",
    lastMessageTime: "12:42 PM",
    unread: 2,
    typing: true,
    pinned: true,
    messages: [
      { id: "m1", senderId: "1", text: "Hey! How's the project going?", timestamp: "12:30 PM", status: "read" },
      { id: "m2", senderId: ME, text: "Pretty good! Just finishing up the chat UI.", timestamp: "12:32 PM", status: "read" },
      { id: "m3", senderId: "1", text: "Oh nice! Can I see a preview?", timestamp: "12:34 PM", status: "read", reactions: [{ emoji: "👀", count: 1, byMe: true }] },
      { id: "m4", senderId: ME, text: "Sure, I'll share it in a bit. It's looking really clean.", timestamp: "12:36 PM", status: "read" },
      { id: "m4b", senderId: ME, text: "", timestamp: "12:37 PM", status: "read", type: "image", imageUrl: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=400&h=300&fit=crop" },
      { id: "m5", senderId: "1", text: "Can't wait! Should we hop on a call later to discuss?", timestamp: "12:38 PM", status: "read", replyTo: { name: "You", text: "Sure, I'll share it in a bit." } },
      { id: "m6", senderId: ME, text: "Yeah, let's do 3pm? I should be done by then.", timestamp: "12:40 PM", status: "delivered" },
      { id: "m7", senderId: "1", text: "That sounds like a great plan! 🎉", timestamp: "12:42 PM", status: "read", reactions: [{ emoji: "🎉", count: 2, byMe: true }, { emoji: "❤️", count: 1, byMe: false }] },
    ],
  },
  {
    user: {
      id: "2",
      name: "Alex Rivera",
      avatar: "",
      online: true,
      bio: "Full-stack engineer",
      phone: "+1 555 234 5678",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Let me check and get back to you",
    lastMessageTime: "11:15 AM",
    unread: 0,
    pinned: true,
    messages: [
      { id: "m8", senderId: ME, text: "Did you get a chance to review the PR?", timestamp: "10:50 AM", status: "read" },
      { id: "m9", senderId: "2", text: "Not yet, been swamped all morning 😅", timestamp: "11:02 AM", status: "read" },
      { id: "m10", senderId: ME, text: "No worries. The main changes are in the sidebar component.", timestamp: "11:05 AM", status: "read" },
      { id: "m10b", senderId: ME, text: "", timestamp: "11:06 AM", status: "read", type: "voice", voiceDuration: "0:42" },
      { id: "m11", senderId: "2", text: "Let me check and get back to you", timestamp: "11:15 AM", status: "read", reactions: [{ emoji: "👍", count: 1, byMe: true }] },
    ],
  },
  {
    user: {
      id: "3",
      name: "Priya Kapoor",
      avatar: "",
      online: false,
      lastSeen: "Today at 9:30 AM",
      bio: "UX Researcher",
      phone: "+91 98765 43210",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "See you tomorrow! 👋",
    lastMessageTime: "Yesterday",
    unread: 0,
    messages: [
      { id: "m12", senderId: "3", text: "Are we still meeting tomorrow?", timestamp: "Yesterday 6:10 PM", status: "read" },
      { id: "m13", senderId: ME, text: "Yes! 10am at the usual spot.", timestamp: "Yesterday 6:15 PM", status: "read" },
      { id: "m14", senderId: "3", text: "See you tomorrow! 👋", timestamp: "Yesterday 6:18 PM", status: "read" },
    ],
  },
  {
    user: {
      id: "4",
      name: "Marcus Chen",
      avatar: "",
      online: false,
      lastSeen: "Today at 8:00 AM",
      bio: "DevOps Lead",
      phone: "+1 555 345 6789",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "The deployment went smoothly",
    lastMessageTime: "Monday",
    unread: 0,
    muted: true,
    messages: [
      { id: "m15", senderId: "4", text: "Just pushed the hotfix", timestamp: "Monday 4:30 PM", status: "read" },
      { id: "m16", senderId: ME, text: "Thanks! I'll verify on staging.", timestamp: "Monday 4:35 PM", status: "read" },
      { id: "m17", senderId: "4", text: "The deployment went smoothly", timestamp: "Monday 4:50 PM", status: "read" },
    ],
  },
  {
    user: {
      id: "5",
      name: "Emma Larsson",
      avatar: "",
      online: true,
      bio: "Creative Director",
      phone: "+46 70 123 4567",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "I love that color palette 🎨",
    lastMessageTime: "Monday",
    unread: 1,
    messages: [
      { id: "m18", senderId: "5", text: "Check out this design I found", timestamp: "Monday 2:00 PM", status: "read" },
      { id: "m18b", senderId: "5", text: "", timestamp: "Monday 2:01 PM", status: "read", type: "image", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
      { id: "m19", senderId: ME, text: "Wow, that's gorgeous!", timestamp: "Monday 2:05 PM", status: "read", reactions: [{ emoji: "🔥", count: 1, byMe: false }] },
      { id: "m20", senderId: "5", text: "I love that color palette 🎨", timestamp: "Monday 2:08 PM", status: "read" },
    ],
  },
  {
    user: {
      id: "6",
      name: "James Okafor",
      avatar: "",
      online: false,
      lastSeen: "Last week",
      bio: "Mobile Developer",
      phone: "+234 801 234 5678",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "Talk soon!",
    lastMessageTime: "Last week",
    unread: 0,
    messages: [
      { id: "m21", senderId: ME, text: "Hey James, long time!", timestamp: "Last week", status: "read" },
      { id: "m22", senderId: "6", text: "I know right! How have you been?", timestamp: "Last week", status: "read" },
      { id: "m23", senderId: ME, text: "Great, just keeping busy. Let's catch up sometime.", timestamp: "Last week", status: "read" },
      { id: "m24", senderId: "6", text: "Talk soon!", timestamp: "Last week", status: "read" },
    ],
  },
  {
    user: {
      id: "7",
      name: "Lina Zhao",
      avatar: "",
      online: true,
      bio: "Data Scientist @ OpenAI",
      phone: "+86 139 1234 5678",
      profilePicture: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    },
    lastMessage: "The model results look promising!",
    lastMessageTime: "11:58 AM",
    unread: 3,
    messages: [
      { id: "m25", senderId: "7", text: "Hey! I just ran the latest training job.", timestamp: "11:40 AM", status: "read" },
      { id: "m26", senderId: ME, text: "How's the accuracy looking?", timestamp: "11:45 AM", status: "read" },
      { id: "m27", senderId: "7", text: "We hit 94.7% on the test set 🚀", timestamp: "11:50 AM", status: "read", reactions: [{ emoji: "🚀", count: 2, byMe: true }] },
      { id: "m28", senderId: ME, text: "That's incredible! What changed?", timestamp: "11:52 AM", status: "delivered" },
      { id: "m29", senderId: "7", text: "The model results look promising!", timestamp: "11:58 AM", status: "read" },
    ],
  },
  {
    user: {
      id: "8",
      name: "Design Team",
      avatar: "",
      online: true,
      bio: "5 members",
      phone: "",
    },
    lastMessage: "📎 Wireframes_v3.fig uploaded",
    lastMessageTime: "10:30 AM",
    unread: 5,
    pinned: true,
    messages: [
      { id: "m30", senderId: "8", text: "Morning everyone! Sprint review at 11.", timestamp: "9:00 AM", status: "read" },
      { id: "m31", senderId: ME, text: "I'll present the new components.", timestamp: "9:15 AM", status: "read" },
      { id: "m32", senderId: "8", text: "📎 Wireframes_v3.fig uploaded", timestamp: "10:30 AM", status: "read" },
    ],
  },
];

export const mockStatuses: Status[] = [
  {
    id: "s1",
    userId: "1",
    userName: "Sarah Mitchell",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    timestamp: "Today, 11:30 AM",
    seen: false,
    items: [
      {
        id: "si1",
        type: "image",
        content: "https://images.unsplash.com/photo-1618788372246-79faff0c3742?w=600&h=900&fit=crop",
        timestamp: "11:30 AM",
        caption: "New design system coming together 🎨",
      },
      {
        id: "si2",
        type: "text",
        content: "Working on something exciting! Stay tuned 🚀",
        backgroundColor: "from-primary to-[hsl(24,70%,46%)]",
        timestamp: "11:45 AM",
      },
    ],
  },
  {
    id: "s2",
    userId: "5",
    userName: "Emma Larsson",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    timestamp: "Today, 10:15 AM",
    seen: false,
    items: [
      {
        id: "si3",
        type: "image",
        content: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=900&fit=crop",
        timestamp: "10:15 AM",
        caption: "Color palette exploration 🎨",
      },
    ],
  },
  {
    id: "s3",
    userId: "7",
    userName: "Lina Zhao",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    timestamp: "Today, 9:00 AM",
    seen: true,
    items: [
      {
        id: "si4",
        type: "text",
        content: "94.7% accuracy! 🎯 New record for the team!",
        backgroundColor: "from-emerald-600 to-teal-700",
        timestamp: "9:00 AM",
      },
    ],
  },
  {
    id: "s4",
    userId: "2",
    userName: "Alex Rivera",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    timestamp: "Yesterday, 8:30 PM",
    seen: true,
    items: [
      {
        id: "si5",
        type: "image",
        content: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=900&fit=crop",
        timestamp: "8:30 PM",
        caption: "Late night coding session 💻",
      },
    ],
  },
];
