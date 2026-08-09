/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Star, MessageSquare, User, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { useToast } from './Toast.tsx';

interface Review {
  id: string;
  user: string;
  rating: number;
  content: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    user: 'James R.',
    rating: 5,
    content: 'Unbelievable precision on the logic board rework. My iPhone had a VDD_MAIN short and D&CP had it back to life in 48 hours.',
    date: '2 days ago'
  },
  {
    id: 'r2',
    user: 'Sarah M.',
    rating: 5,
    content: 'The screen quality is indistinguishable from the original. Excellent service and very transparent pricing.',
    date: '1 week ago'
  }
];

export default function Reviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [isAdding, setIsAdding] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', user: '' });

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.content || !newReview.user) return;
    
    const review: Review = {
      id: Math.random().toString(36).substr(2, 9),
      user: newReview.user,
      rating: newReview.rating,
      content: newReview.content,
      date: 'Just now'
    };
    
    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, content: '', user: '' });
    setIsAdding(false);
    showToast('Review posted successfully. We appreciate your feedback!', 'success');
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Service Reliability</h2>
            <h3 className="text-4xl font-playfair font-black text-slate-900">Verified Client Feedback</h3>
          </div>
          
          <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900">{avgRating}</div>
              <div className="flex gap-0.5 text-yellow-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3 fill-current", i >= Math.round(Number(avgRating)) && "text-slate-200")} />
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviews.length} Reviews</div>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Leave a Review
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border-2 border-blue-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
                    <input 
                      required
                      value={newReview.user}
                      onChange={e => setNewReview({ ...newReview, user: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Star Rating</label>
                    <div className="flex gap-2 h-12 items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: s })}
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                            newReview.rating >= s ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-400"
                          )}
                        >
                          <Star className={cn("w-5 h-5", newReview.rating >= s && "fill-current")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Experience</label>
                  <textarea 
                    required
                    value={newReview.content}
                    onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                    rows={4}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                  Post Review
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{review.user}</h4>
                    <div className="flex gap-0.5 text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</span>
              </div>
              <p className="text-slate-600 leading-relaxed italic">"{review.content}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
