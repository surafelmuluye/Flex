'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Globe, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { NormalizedReview } from '@/lib/db/schema';

interface ReviewCardProps {
  review: NormalizedReview;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onTogglePublic: (id: number) => Promise<void>;
  onViewDetails: (review: NormalizedReview) => void;
  isProcessing: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onApprove,
  onReject,
  onTogglePublic,
  onViewDetails,
  isProcessing,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 text-sm">
                {review.authorName || 'Anonymous'}
              </h4>
              <p className="text-xs text-slate-600">
                {review.listing?.name || 'Unknown Property'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
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
              <Globe className="h-3 w-3 text-green-600" />
            ) : (
              <Lock className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < (review.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-600">
            {review.rating}/5
          </span>
          <span className="text-xs text-slate-500">
            • {review.submittedAt
              ? new Date(review.submittedAt).toLocaleDateString()
              : 'Unknown date'}
          </span>
        </div>

        <p className="text-sm text-slate-700 mb-4 line-clamp-3">
          {review.content || 'No content available'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(review)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            {review.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(review.id)}
                  disabled={isProcessing}
                  className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(review.id)}
                  disabled={isProcessing}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePublic(review.id)}
            disabled={isProcessing}
            className="text-xs"
          >
            {review.isPublic ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Make Private
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Make Public
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;