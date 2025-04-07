// src/pages/dashboard/settings.tsx
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SettingsLayout from '../../components/settings/SettingsLayout';
import PersonalInformationSettings from '../../components/settings/PersonalInformationSettings';
import HabitSettings from '../../components/settings/HabitSettings';

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <SettingsLayout>
        {(activeSection) => (
          <>
            {activeSection === 'personal' && <PersonalInformationSettings />}
            {activeSection === 'habits' && <HabitSettings />}
          </>
        )}
      </SettingsLayout>
    </DashboardLayout>
  );
};

export default SettingsPage;