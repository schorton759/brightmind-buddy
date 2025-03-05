
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        currentView="profile" 
        profile={profile}
        onBack={() => navigate('/')}
      />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Username</h3>
                <p>{profile?.username}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Account Type</h3>
                <p>{profile?.user_type === 'child' ? 'Child Account' : 'Parent Account'}</p>
              </div>
              
              {profile?.age_group && (
                <div>
                  <h3 className="text-sm font-medium">Age Group</h3>
                  <p>{profile?.age_group}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
