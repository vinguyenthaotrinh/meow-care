// src/pages/settings.tsx
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SettingsLayout from '../components/settings/SettingsLayout';
import PersonalInformationSettings from '../components/settings/PersonalInformationSettings';
import HabitSettings from '../components/settings/HabitSettings';
// Không cần import styles hay spinner ở đây nữa

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <SettingsLayout>
        {(activeSection) => (
          // settingsContent được render bởi SettingsLayout
          // Component con sẽ tự render spinner hoặc nội dung bên trong settingsContent
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