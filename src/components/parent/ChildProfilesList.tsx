
import React from 'react';
import ChildProfileCard from './child-profile/ChildProfileCard';
import ChildCredentialsDialog from './child-profile/ChildCredentialsDialog';
import LoadingChildProfiles from './child-profile/LoadingChildProfiles';
import EmptyChildProfilesList from './child-profile/EmptyChildProfilesList';
import { useChildProfiles } from './child-profile/useChildProfiles';

const ChildProfilesList = ({ 
  refreshTrigger, 
  onCreateCredentials,
  onViewChildDashboard
}: { 
  refreshTrigger: number;
  onCreateCredentials: (childId: string) => void;
  onViewChildDashboard: (childId: string, username: string) => void;
}) => {
  const { 
    childProfiles,
    loading,
    selectedChild,
    showCredentialsDialog,
    setShowCredentialsDialog,
    credentials,
    creatingCredentials,
    handleCreateCredentials,
    handleViewCredentials,
    handleDeleteChild
  } = useChildProfiles(refreshTrigger);

  if (loading) {
    return <LoadingChildProfiles />;
  }

  if (childProfiles.length === 0) {
    return <EmptyChildProfilesList />;
  }

  return (
    <div className="space-y-4">
      {childProfiles.map(child => (
        <ChildProfileCard 
          key={child.id}
          child={child}
          onDelete={handleDeleteChild}
          onCreateCredentials={handleCreateCredentials}
          onViewCredentials={handleViewCredentials}
          onViewDashboard={onViewChildDashboard}
          isCreatingCredentials={creatingCredentials}
          selectedChildId={selectedChild?.id || null}
        />
      ))}

      <ChildCredentialsDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        credentials={credentials}
      />
    </div>
  );
};

export default ChildProfilesList;
