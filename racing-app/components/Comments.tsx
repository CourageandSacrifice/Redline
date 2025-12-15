'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageCircle, Send, Heart, Trash2, Loader2 } from 'lucide-react';

interface CommentUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
  user: CommentUser | null;
  replies?: Comment[];
}

interface CommentsProps {
  clipId: string;
  commentCount: number;
}

export default function Comments({ clipId, commentCount: initialCount }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentCount, setCommentCount] = useState(initialCount);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [clipId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const transformComment = (raw: any): Comment => {
    // Handle user being an array (from Supabase join) or single object
    const user = Array.isArray(raw.user) ? raw.user[0] : raw.user;
    return {
      id: raw.id,
      content: raw.content,
      like_count: raw.like_count || 0,
      created_at: raw.created_at,
      user: user || null,
      replies: raw.replies?.map(transformComment) || [],
    };
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        like_count,
        created_at,
        parent_id,
        user:users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('clip_id', clipId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment: any) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              id,
              content,
              like_count,
              created_at,
              user:users (
                id,
                username,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });
          
          return transformComment({ ...comment, replies: replies || [] });
        })
      );
      setComments(commentsWithReplies);
    }
    setLoading(false);
  };

  const postComment = async (parentId: string | null = null) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPosting(false);
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        clip_id: clipId,
        user_id: user.id,
        parent_id: parentId,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        like_count,
        created_at,
        user:users (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (data) {
      const newCommentData = transformComment(data);
      
      if (parentId) {
        // Add reply to parent comment
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { ...c, replies: [...(c.replies || []), newCommentData] }
            : c
        ));
        setReplyContent('');
        setReplyingTo(null);
      } else {
        // Add new top-level comment
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
      }
      setCommentCount(prev => prev + 1);
    }
    setPosting(false);
  };

  const deleteComment = async (commentId: string, parentId: string | null) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      if (parentId) {
        setComments(prev => prev.map(c =>
          c.id === parentId
            ? { ...c, replies: c.replies?.filter(r => r.id !== commentId) }
            : c
        ));
      } else {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
      setCommentCount(prev => prev - 1);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }: { comment: Comment; isReply?: boolean; parentId?: string | null }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img src={comment.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            comment.user?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-x-white text-sm">{comment.user?.username || 'Unknown'}</span>
            <span className="text-x-gray text-xs">· {formatTime(comment.created_at)}</span>
          </div>
          <p className="text-x-lightgray text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button className="flex items-center gap-1 text-x-gray hover:text-accent text-xs transition-colors">
              <Heart className="w-4 h-4" />
              {comment.like_count > 0 && comment.like_count}
            </button>
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-x-gray hover:text-accent text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            )}
            {currentUserId === comment.user?.id && (
              <button 
                onClick={() => deleteComment(comment.id, parentId)}
                className="flex items-center gap-1 text-x-gray hover:text-accent text-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && postComment(comment.id)}
                placeholder="Write a reply..."
                className="input-racing flex-1 py-2 text-sm"
                autoFocus
              />
              <button
                onClick={() => postComment(comment.id)}
                disabled={!replyContent.trim() || posting}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply parentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-x-border flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-accent" />
        <h3 className="font-display font-bold text-x-white">Comments</h3>
        <span className="text-x-gray text-sm">({commentCount})</span>
      </div>

      {/* New comment input */}
      <div className="p-4 border-b border-x-border">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            U
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && postComment()}
              placeholder="Add a comment..."
              className="input-racing flex-1"
            />
            <button
              onClick={() => postComment()}
              disabled={!newComment.trim() || posting}
              className="btn-accent px-4 disabled:opacity-50"
            >
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-x-gray">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
