
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
    handleDeleteChild,
    fetchChildProfiles
  } = useChildProfiles(refreshTrigger);

  // Handle the creation of credentials, ensuring UI updates
  const handleChildCredentialsCreation = async (child) => {
    try {
      const createdCredentials = await handleCreateCredentials(child);
      console.log("Credentials created successfully:", createdCredentials);
      
      // The UI should already be updated in the handleCreateCredentials function,
      // but we'll do an additional fetch to be sure
      fetchChildProfiles();
    } catch (error) {
      console.error("Error creating credentials:", error);
    }
  };

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
          onCreateCredentials={handleChildCredentialsCreation}
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
