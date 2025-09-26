'use client';

import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  User, 
  Building, 
  MessageSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Target,
  Globe,
  Lock,
  X
} from 'lucide-react';
import { NormalizedReview } from '@/lib/db/schema';

interface ReviewModalProps {
  review: NormalizedReview | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, isOpen, onClose }) => {
  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Review Details
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-2">
                Complete review information and management options
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Review Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {review.authorName || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-slate-600">{review.authorName || 'Anonymous'}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (review.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    review.status === 'approved'
                      ? 'default'
                      : review.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="text-xs"
                >
                  {review.status}
                </Badge>
                {review.isPublic ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-600 border-gray-200">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-slate-600" />
              <div>
                <h4 className="font-medium text-slate-900">
                  {review.listing?.name || 'Unknown Property'}
                </h4>
                <p className="text-sm text-slate-600">
                  {review.listingId || 'No address available'}
                </p>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
              Review Content
            </h4>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-slate-700 leading-relaxed">
                {review.content || 'No content available'}
              </p>
            </div>
          </div>

          {/* Category Ratings */}
          {review.categories && review.categories.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Category Ratings
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {review.categories.map((category: any, index: number) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {category.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < (category.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-600 ml-1">
                          {category.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                Submitted
              </h5>
              <p className="text-sm text-slate-600">
                {review.submittedAt
                  ? new Date(review.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Not available'}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Type
              </h5>
              <p className="text-sm text-slate-600 capitalize">
                {review.type?.replace('-', ' to ') || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {review.notes && (
            <div className="space-y-2">
              <h5 className="font-medium text-slate-900 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                Notes
              </h5>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">{review.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
