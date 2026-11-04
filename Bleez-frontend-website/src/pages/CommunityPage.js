import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  MessageCircle, Send, MapPin, Users, AlertTriangle, 
  Loader2, Shield, Trash2, Circle, ArrowLeft, User
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Force clear all browser storage and cache for chat data
const forceClearChatCache = async () => {
  try {
    // 1. Clear localStorage chat data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chat') || key.includes('message') || key.includes('community') || key.includes('online'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 2. Clear sessionStorage
    sessionStorage.clear();
    
    // 3. Tell service worker to purge cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_PURGE_CACHE' });
    }
    
    // 4. Clear IndexedDB chat databases
    if (typeof indexedDB !== 'undefined') {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('chat') || db.name.includes('message'))) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (e) {
        // IndexedDB.databases() not supported in all browsers
      }
    }
    
    console.log('[Community] Cache cleared');
  } catch (e) {
    console.log('[Community] Cache clear error:', e);
  }
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState('');
  const scrollRef = useRef(null);
  const pollRef = useRef(null);
  
  // Private messaging state
  const [activeTab, setActiveTab] = useState('community');
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get auth token
  const getAuthToken = () => token || localStorage.getItem('token');

  // Force clear cache on mount
  useEffect(() => {
    forceClearChatCache();
  }, []);

  useEffect(() => {
    const authToken = getAuthToken();
    if (authToken) {
      fetchMessages();
      fetchOnlineUsers();
      fetchConversations();
      fetchUnreadCount();
      
      // Poll for new messages every 5 seconds
      pollRef.current = setInterval(() => {
        fetchMessages();
        fetchOnlineUsers();
        if (activeTab === 'private') {
          fetchConversations();
          fetchUnreadCount();
          if (selectedPartner) {
            fetchPrivateMessages(selectedPartner.id);
          }
        }
      }, 5000);
    } else {
      setLoading(false);
    }
    
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, activeTab, selectedPartner]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, privateMessages]);

  const fetchMessages = async () => {
    const authToken = getAuthToken();
    try {
      // Add timestamp to prevent any caching
      const response = await axios.get(`${API}/community/messages?_t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]); // Clear on error to prevent stale data
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    const authToken = getAuthToken();
    try {
      // Add timestamp to prevent any caching
      const response = await axios.get(`${API}/community/online-users?_t=${Date.now()}`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setOnlineUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch online users:', error);
      setOnlineUsers([]); // Clear on error to prevent stale data
    }
  };

  const fetchConversations = async () => {
    const authToken = getAuthToken();
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchPrivateMessages = async (partnerId) => {
    const authToken = getAuthToken();
    try {
      const response = await axios.get(`${API}/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPrivateMessages(response.data);
      fetchUnreadCount(); // Update unread count after reading
    } catch (error) {
      console.error('Failed to fetch private messages:', error);
    }
  };

  const fetchUnreadCount = async () => {
    const authToken = getAuthToken();
    try {
      const response = await axios.get(`${API}/messages/unread/count`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!user || !getAuthToken()) {
      toast.error('Please sign in to chat');
      navigate('/login');
      return;
    }

    setSending(true);
    const authToken = getAuthToken();
    try {
      const response = await axios.post(
        `${API}/community/messages`,
        { message: input, location_approximate: location || null },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setMessages([...messages, response.data]);
      setInput('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendPrivateMessage = async () => {
    if (!input.trim() || !selectedPartner) return;
    
    const authToken = getAuthToken();
    setSending(true);
    try {
      const response = await axios.post(
        `${API}/messages`,
        { recipient_id: selectedPartner.id, content: input },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setPrivateMessages([...privateMessages, response.data]);
      setInput('');
    } catch (error) {
      console.error('Send private message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startPrivateChat = (userToChat) => {
    setSelectedPartner(userToChat);
    setActiveTab('private');
    fetchPrivateMessages(userToChat.id);
  };

  const deleteMessage = async (messageId) => {
    const authToken = getAuthToken();
    try {
      await axios.delete(`${API}/community/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMessages(messages.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const clearCommunityMessages = async () => {
    if (!window.confirm('Are you sure you want to delete all your community messages? This action cannot be undone.')) {
      return;
    }
    
    const authToken = getAuthToken();
    try {
      const response = await axios.delete(`${API}/community/messages/clear-all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Remove all messages from this user
      setMessages(messages.filter(m => m.user_id !== user?.id));
      toast.success(`Deleted ${response.data.deleted_count} community messages`);
    } catch (error) {
      console.error('Clear community messages error:', error);
      toast.error('Failed to clear messages');
    }
  };

  const clearPrivateMessages = async () => {
    if (!window.confirm('Are you sure you want to delete all your sent private messages? This action cannot be undone.')) {
      return;
    }
    
    const authToken = getAuthToken();
    try {
      const response = await axios.delete(`${API}/messages/clear-all`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Refresh private messages and conversations
      if (selectedPartner) {
        fetchPrivateMessages(selectedPartner.id);
      }
      fetchConversations();
      toast.success(`Deleted ${response.data.deleted_count} private messages`);
    } catch (error) {
      console.error('Clear private messages error:', error);
      toast.error('Failed to clear messages');
    }
  };

  const clearConversation = async () => {
    if (!selectedPartner) return;
    
    if (!window.confirm(`Are you sure you want to delete all messages you sent to ${selectedPartner.name}? This action cannot be undone.`)) {
      return;
    }
    
    const authToken = getAuthToken();
    try {
      const response = await axios.delete(`${API}/messages/${selectedPartner.id}/clear`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      // Refresh messages
      fetchPrivateMessages(selectedPartner.id);
      fetchConversations();
      toast.success(`Deleted ${response.data.deleted_count} messages`);
    } catch (error) {
      console.error('Clear conversation error:', error);
      toast.error('Failed to clear conversation');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-hidden" data-testid="community-page">
      <Navbar />
      <PageHero image={IMG.street(1600)} eyebrow="Community" title="Travel stories & tips" subtitle="Learn from fellow travellers and share your own journeys." />
      
      <main className="flex-1 pt-10 sm:pt-24 pb-8 sm:pb-12">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-background" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif mb-2">Travelers Community</h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Connect with fellow travelers, share tips, and discover local insights
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium">Privacy First</p>
                <p className="text-muted-foreground">
                  Only approximate locations are shared. Your exact location is never revealed.
                </p>
              </div>
            </div>

            {/* Main Chat Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-4 sm:mb-6 bg-white/5">
                <TabsTrigger value="community" className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Community</span>
                  <span className="xs:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="private" className="flex-1 gap-1 sm:gap-2 relative text-xs sm:text-sm">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Private Messages</span>
                  <span className="xs:hidden">Private</span>
                  {unreadCount > 0 && (
                    <Badge className="ml-1 bg-primary text-xs">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                  {/* Online Users Sidebar */}
                  <div className="md:col-span-1 order-2 md:order-1">
                    <div className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
                      <h3 className="font-medium mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <Users className="w-4 h-4 text-primary" />
                        Online
                        <span className="ml-auto text-xs text-muted-foreground">
                          {onlineUsers.length}
                        </span>
                      </h3>
                      
                      {/* Clear Community Messages Button - Always visible for logged in users */}
                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCommunityMessages}
                          className="w-full mb-4 text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={!messages.some(m => m.user_id === user?.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear My Messages
                        </Button>
                      )}
                      
                      {onlineUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No other members online
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {onlineUsers.map((u) => (
                            <div 
                              key={u.id} 
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                              onClick={() => startPrivateChat(u)}
                            >
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  {u.picture ? (
                                    <AvatarImage src={u.picture} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                      {u.name?.charAt(0) || u.email?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-500 fill-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {u.name || 'Traveler'}
                                </p>
                              </div>
                              <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Community Chat Container */}
                  <div className="md:col-span-3 order-1 md:order-2 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    {/* Messages */}
                    <ScrollArea className="h-[350px] sm:h-[450px] md:h-[500px] p-4 sm:p-6" ref={scrollRef}>
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                          <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
                          <p className="text-sm sm:text-base text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {messages.map((msg) => (
                            <div 
                              key={msg.id}
                              className={`flex gap-2 sm:gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}
                              data-testid={`message-${msg.id}`}
                            >
                              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                                {msg.user_picture ? (
                                  <AvatarImage src={msg.user_picture} />
                                ) : (
                                  <AvatarFallback className="bg-primary/20 text-primary text-xs sm:text-sm">
                                    {msg.user_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <div className={`max-w-[70%] ${msg.user_id === user?.id ? 'text-right' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{msg.user_name}</span>
                                  {msg.location_approximate && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {msg.location_approximate}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(msg.created_at)}
                                  </span>
                                </div>
                          
                          <div className={`inline-block p-3 rounded-2xl ${
                            msg.user_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-white/10'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          
                          {msg.user_id === user?.id && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="text-xs text-muted-foreground hover:text-destructive mt-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                {!user && (
                  <div className="text-center mb-4 p-3 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">
                      <Button 
                        variant="link" 
                        className="text-primary p-0 h-auto"
                        onClick={() => navigate('/login')}
                      >
                        Sign in
                      </Button>
                      {' '}to join the conversation
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Your location (optional)"
                    className="w-40 bg-white/5 border-white/10 text-sm"
                    data-testid="input-location"
                  />
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={user ? "Share a tip or ask a question..." : "Sign in to chat"}
                    className="flex-1 bg-white/5 border-white/10"
                    disabled={!user}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!user || sending || !input.trim()}
                    className="btn-primary"
                    data-testid="btn-send"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
                  </div>
                </div>
              </TabsContent>

              {/* Private Messages Tab */}
              <TabsContent value="private">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Conversations Sidebar */}
                  <div className="md:col-span-1 order-2 md:order-1">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        Conversations
                      </h3>
                      
                      {/* Clear All Private Messages Button - Always visible for logged in users */}
                      {user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearPrivateMessages}
                          className="w-full mb-4 text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={conversations.length === 0}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All Sent
                        </Button>
                      )}
                      
                      {conversations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No conversations yet. Click on a user in Community to start chatting!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {conversations.map((conv) => (
                            <div 
                              key={conv.partner_id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedPartner?.id === conv.partner_id 
                                  ? 'bg-primary/20' 
                                  : 'hover:bg-white/5'
                              }`}
                              onClick={() => {
                                setSelectedPartner({ id: conv.partner_id, name: conv.partner_name, picture: conv.partner_picture });
                                fetchPrivateMessages(conv.partner_id);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  {conv.partner_picture ? (
                                    <AvatarImage src={conv.partner_picture} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                      {conv.partner_name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate">{conv.partner_name}</p>
                                    {conv.unread_count > 0 && (
                                      <Badge className="bg-primary text-xs">{conv.unread_count}</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Private Chat Container */}
                  <div className="md:col-span-3 order-1 md:order-2 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    {selectedPartner ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setSelectedPartner(null)}
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </Button>
                          <Avatar className="w-10 h-10">
                            {selectedPartner.picture ? (
                              <AvatarImage src={selectedPartner.picture} />
                            ) : (
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {selectedPartner.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{selectedPartner.name}</p>
                            <p className="text-xs text-muted-foreground">Private conversation</p>
                          </div>
                          {/* Clear This Conversation Button */}
                          {privateMessages.some(m => m.sender_id === user?.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearConversation}
                              className="text-destructive hover:bg-destructive/10"
                              title="Clear my messages in this conversation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Private Messages */}
                        <ScrollArea className="h-[400px] p-6" ref={scrollRef}>
                          {privateMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <User className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No messages yet. Say hello!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {privateMessages.map((msg) => (
                                <div 
                                  key={msg.id}
                                  className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}
                                >
                                  <Avatar className="w-8 h-8 shrink-0">
                                    {msg.sender_picture ? (
                                      <AvatarImage src={msg.sender_picture} />
                                    ) : (
                                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {msg.sender_name?.charAt(0) || '?'}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className={`max-w-[70%] ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                                    <div className={`p-3 rounded-2xl ${
                                      msg.sender_id === user?.id 
                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                        : 'bg-white/10 rounded-bl-none'
                                    }`}>
                                      <p className="text-sm">{msg.content}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                      {formatTime(msg.created_at)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>

                        {/* Private Message Input */}
                        <div className="p-4 border-t border-white/10">
                          <div className="flex gap-3">
                            <Input
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage()}
                              placeholder={`Message ${selectedPartner.name}...`}
                              className="flex-1 bg-white/5 border-white/10"
                            />
                            <Button
                              onClick={sendPrivateMessage}
                              disabled={sending || !input.trim()}
                              className="btn-primary"
                            >
                              {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[500px] text-center p-6">
                        <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                          Choose a conversation from the sidebar or go to the Community tab and click on a user to start a private chat.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Guidelines */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                Community Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be respectful and helpful to fellow travelers</li>
                <li>• Share genuine travel tips and experiences</li>
                <li>• Report any suspicious or harmful content</li>
                <li>• Keep personal information private</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityPage;
