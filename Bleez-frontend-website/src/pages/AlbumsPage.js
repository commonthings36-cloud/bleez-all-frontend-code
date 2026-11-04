import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  FolderPlus, Folder, Share2, Lock, Globe, Trash2, 
  Loader2, ExternalLink, Calendar, MapPin, Plus,
  Image, Video, Upload, X, Eye, EyeOff, GripVertical
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AlbumsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Get auth token from state or localStorage
  const getAuthToken = () => token || localStorage.getItem('token');

  const fetchAlbumsInternal = useCallback(async () => {
    const authToken = getAuthToken();
    try {
      const response = await axios.get(`${API}/albums`, { 
        withCredentials: true,
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      setAlbums(response.data);
    } catch (error) {
      console.error('Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchAlbumDetails = useCallback(async (albumId) => {
    try {
      const response = await axios.get(`${API}/albums/${albumId}`, { 
        withCredentials: true,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setSelectedAlbum(response.data);
    } catch (error) {
      toast.error('Failed to load album');
    }
  }, [token]);

  useEffect(() => {
    if (!token && !user) {
      navigate('/login');
      return;
    }
    fetchAlbumsInternal();
  }, [token, user, navigate, fetchAlbumsInternal]);

  // Auto-select album from URL parameter
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && albums.length > 0 && !selectedAlbum) {
      const album = albums.find(a => a.id === selectedId);
      if (album) {
        fetchAlbumDetails(selectedId);
        toast.info(`Opening album: ${album.name}`);
      }
    }
  }, [searchParams, albums, selectedAlbum, fetchAlbumDetails]);

  const createAlbum = async () => {
    if (!newAlbum.name.trim()) {
      toast.error('Please enter an album name');
      return;
    }
    
    const authToken = getAuthToken();
    if (!authToken) {
      toast.error('Please log in to create albums');
      return;
    }
    
    setCreating(true);
    try {
      const response = await axios.post(
        `${API}/albums`,
        {
          name: newAlbum.name.trim(),
          description: newAlbum.description || ''
        },
        { 
          withCredentials: true,
          timeout: 30000,
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data && response.data.id) {
        setAlbums([response.data, ...albums]);
        setNewAlbum({ name: '', description: '' });
        setCreateOpen(false);
        toast.success('Album created!');
      } else {
        toast.error('Unexpected response. Please refresh the page.');
      }
    } catch (error) {
      console.error('Album creation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create album. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const uploadMedia = useCallback(async (files, albumId) => {
    if (!files || files.length === 0) return;

    const authToken = getAuthToken();
    setUploading(true);
    const uploadPromises = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      // Try to extract capture date from file name or use current date
      const captureDate = new Date().toISOString().split('T')[0];
      formData.append('capture_date', captureDate);

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      uploadPromises.push(
        axios.post(`${API}/albums/${albumId}/media`, formData, {
          withCredentials: true,
          headers
        })
      );
    }

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} file(s) uploaded!`);
      fetchAlbumDetails(albumId);
    } catch (error) {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  }, [fetchAlbumDetails]);

  const handleDrop = useCallback((e, albumId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer?.files;
    if (files) {
      uploadMedia(Array.from(files), albumId);
    }
  }, [uploadMedia]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Get auth config with token from state or localStorage
  const getAuthConfig = () => {
    const authToken = getAuthToken();
    return {
      withCredentials: true,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };
  };

  const updateMediaCaption = async (albumId, mediaId, caption) => {
    try {
      await axios.put(
        `${API}/albums/${albumId}/media/${mediaId}?caption=${encodeURIComponent(caption)}`,
        {},
        getAuthConfig()
      );
      fetchAlbumDetails(albumId);
    } catch (error) {
      toast.error('Failed to update caption');
    }
  };

  const toggleMediaVisibility = async (albumId, mediaId, currentHidden) => {
    try {
      await axios.put(
        `${API}/albums/${albumId}/media/${mediaId}?hidden=${!currentHidden}`,
        {},
        getAuthConfig()
      );
      fetchAlbumDetails(albumId);
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const deleteMedia = async (albumId, mediaId) => {
    if (!window.confirm('Delete this media?')) return;
    
    try {
      await axios.delete(`${API}/albums/${albumId}/media/${mediaId}`, getAuthConfig());
      toast.success('Media deleted');
      fetchAlbumDetails(albumId);
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const togglePublic = async (album) => {
    try {
      await axios.put(
        `${API}/albums/${album.id}?is_public=${!album.is_public}`,
        {},
        getAuthConfig()
      );
      setAlbums(albums.map(a => 
        a.id === album.id ? { ...a, is_public: !a.is_public } : a
      ));
      toast.success(album.is_public ? 'Album is now private' : 'Album is now public');
    } catch (error) {
      toast.error('Failed to update album');
    }
  };

  const deleteAlbum = async (albumId) => {
    if (!window.confirm('Delete this album and all its media?')) return;
    
    try {
      await axios.delete(`${API}/albums/${albumId}`, getAuthConfig());
      setAlbums(albums.filter(a => a.id !== albumId));
      setSelectedAlbum(null);
      toast.success('Album deleted');
    } catch (error) {
      toast.error('Failed to delete album');
    }
  };

  const copyShareLink = (album) => {
    const link = `${window.location.origin}/albums/shared/${album.share_token}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="albums-loading">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="albums-page">
      <Navbar />
      <PageHero image={IMG.paradise(1600)} eyebrow="Albums" title="Your travel memories" subtitle="Keep photos from every trip together." />
      
      <main className="flex-1 pt-10 pb-12">
        <div className="container-main">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">
                Trip Collections
              </p>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight">
                My Albums
              </h1>
              <p className="text-muted-foreground mt-2">
                Organize trips and upload photos & videos
              </p>
            </div>
            
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary gap-2" data-testid="btn-create-album">
                  <FolderPlus className="w-5 h-5" />
                  New Album
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/10">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Create New Album</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Album Name</Label>
                    <Input
                      value={newAlbum.name}
                      onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                      placeholder="e.g., Business Asia 2025"
                      className="bg-white/5 border-white/10"
                      data-testid="input-album-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={newAlbum.description}
                      onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                      placeholder="What's this collection about?"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={createAlbum} 
                    disabled={creating}
                    className="w-full btn-primary"
                    data-testid="btn-submit-album"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Album
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Albums List */}
            <div className="lg:col-span-1 space-y-4">
              {albums.length > 0 ? (
                albums.map((album) => (
                  <div 
                    key={album.id}
                    onClick={() => fetchAlbumDetails(album.id)}
                    className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedAlbum?.id === album.id 
                        ? 'bg-primary/10 border border-primary/50' 
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                    data-testid={`album-card-${album.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {album.cover_image ? (
                        <img 
                          src={`${BACKEND_URL}${album.cover_image}`}
                          alt={album.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Folder className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{album.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{album.media?.length || 0} items</span>
                          {album.is_public ? (
                            <Globe className="w-3 h-3 text-green-500" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No albums yet</p>
                </div>
              )}
            </div>

            {/* Album Details & Media */}
            <div className="lg:col-span-2">
              {selectedAlbum ? (
                <div className="space-y-6">
                  {/* Album Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-serif">{selectedAlbum.name}</h2>
                      {selectedAlbum.description && (
                        <p className="text-muted-foreground mt-1">{selectedAlbum.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedAlbum.is_public}
                          onCheckedChange={() => {
                            togglePublic(selectedAlbum);
                            setSelectedAlbum(prev => ({ ...prev, is_public: !prev.is_public }));
                          }}
                        />
                        <Label className="text-xs">Public</Label>
                      </div>
                      {selectedAlbum.is_public && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyShareLink(selectedAlbum)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlbum(selectedAlbum.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div
                    onDrop={(e) => handleDrop(e, selectedAlbum.id)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/heic,video/mp4,video/quicktime"
                      className="hidden"
                      onChange={(e) => uploadMedia(Array.from(e.target.files || []), selectedAlbum.id)}
                    />
                    
                    {uploading ? (
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Drag & drop photos or videos here
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/5 border-white/10"
                          data-testid="btn-upload-media"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Select Files
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                          Supported: JPG, PNG, HEIC, MP4, MOV (max 50MB)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Media Grid */}
                  {selectedAlbum.media && selectedAlbum.media.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedAlbum.media.map((media) => (
                        <div 
                          key={media.id}
                          className={`relative group rounded-xl overflow-hidden ${
                            media.hidden ? 'opacity-50' : ''
                          }`}
                        >
                          {media.media_type === 'video' ? (
                            <video
                              src={`${BACKEND_URL}${media.url}`}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <img
                              src={`${BACKEND_URL}${media.url}`}
                              alt={media.caption || 'Album photo'}
                              className="w-full h-40 object-cover"
                            />
                          )}
                          
                          {/* Media type indicator */}
                          <div className="absolute top-2 left-2">
                            {media.media_type === 'video' ? (
                              <Video className="w-5 h-5 text-white drop-shadow-lg" />
                            ) : (
                              <Image className="w-5 h-5 text-white drop-shadow-lg" />
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20"
                              onClick={() => toggleMediaVisibility(selectedAlbum.id, media.id, media.hidden)}
                            >
                              {media.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20"
                              onClick={() => deleteMedia(selectedAlbum.id, media.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Caption */}
                          {media.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-xs text-white truncate">{media.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Label className="text-sm text-muted-foreground">Album Notes</Label>
                    <Textarea
                      value={selectedAlbum.notes || ''}
                      onChange={(e) => setSelectedAlbum(prev => ({ ...prev, notes: e.target.value }))}
                      onBlur={async () => {
                        try {
                          await axios.put(
                            `${API}/albums/${selectedAlbum.id}?notes=${encodeURIComponent(selectedAlbum.notes || '')}`,
                            {},
                            getAuthConfig()
                          );
                        } catch (e) {
                          // Silent fail for notes update
                        }
                      }}
                      placeholder="Add notes about this trip..."
                      className="mt-2 bg-transparent border-0 p-0 resize-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-center">
                  <div>
                    <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select an album to view and manage media</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AlbumsPage;
