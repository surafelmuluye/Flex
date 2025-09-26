'use client';

import React, { useState } from 'react';
import { ReviewCard } from './review-card';
import { NormalizedReview } from '@/lib/db/schema';

interface DashboardClientProps {
  recentReviews: NormalizedReview[];
}

export function DashboardClient({ recentReviews }: DashboardClientProps) {
  const [processing, setProcessing] = useState<number | null>(null);

  const handleApprove = async (reviewId: number) => {
    try {
      setProcessing(reviewId);
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error approving review:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      setProcessing(reviewId);
      const response = await fetch(`/api/reviews/hostaway/${reviewId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false })
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {recentReviews.slice(0, 5).map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onApprove={handleApprove}
          onReject={handleReject}
          onTogglePublic={async (id: number) => {}}
          onViewDetails={() => {}}
          isProcessing={processing === review.id}
        />
      ))}
    </div>
  );
}
