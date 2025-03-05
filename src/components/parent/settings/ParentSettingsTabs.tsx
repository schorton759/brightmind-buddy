
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppAccessControls from '@/components/parent/settings/AppAccessControls';
import ApiSettings from '@/components/parent/settings/ApiSettings';

const ParentSettingsTabs = () => {
  return (
    <Tabs defaultValue="app-access" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="app-access">App Access Controls</TabsTrigger>
        <TabsTrigger value="api-settings">API Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="app-access" className="mt-6">
        <AppAccessControls />
      </TabsContent>
      
      <TabsContent value="api-settings" className="mt-6">
        <ApiSettings />
      </TabsContent>
    </Tabs>
  );
};

export default ParentSettingsTabs;
