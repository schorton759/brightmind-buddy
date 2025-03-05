
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingChildProfiles = () => {
  return (
    <div className="space-y-3">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingChildProfiles;
