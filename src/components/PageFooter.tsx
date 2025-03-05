
import React from 'react';

type PageFooterProps = {
  coachTip: string;
};

const PageFooter = ({ coachTip }: PageFooterProps) => {
  return (
    <footer className="border-t mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>BrightMind Buddy - Helping children build great habits</p>
        {coachTip && (
          <p className="mt-2 italic">"{coachTip}"</p>
        )}
      </div>
    </footer>
  );
};

export default PageFooter;
