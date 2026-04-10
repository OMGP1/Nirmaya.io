const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = [
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/components/appointments/AppointmentCard.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/components/booking/WizardSteps/Step4Confirm.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/components/booking/WizardSteps/Step5Success.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/admin/AdminAppointments.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/admin/AdminDashboard.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/Dashboard.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/doctor/AppointmentDetail.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/doctor/DoctorAppointments.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/doctor/DoctorDashboard.jsx',
  'c:/Users/Havish/OneDrive/Desktop/healthcare_appointment/client/src/pages/doctor/DoctorSchedule.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (content.includes('parseISO(apt.start_time)')) {
    content = content.replace(/parseISO\(apt\.start_time\)/g, 'getLocalTimeFromUTC(apt.start_time)');
    changed = true;
  }
  if (content.includes('parseISO(appointment.start_time)')) {
    content = content.replace(/parseISO\(appointment\.start_time\)/g, 'getLocalTimeFromUTC(appointment.start_time)');
    changed = true;
  }
  if (content.includes('new Date(apt.start_time)')) {
    content = content.replace(/new Date\(apt\.start_time\)/g, 'getLocalTimeFromUTC(apt.start_time)');
    changed = true;
  }
  if (content.includes('new Date(appointment.start_time)')) {
    content = content.replace(/new Date\(appointment\.start_time\)/g, 'getLocalTimeFromUTC(appointment.start_time)');
    changed = true;
  }
  if (content.includes('new Date(appointmentTime)')) {
    content = content.replace(/new Date\(appointmentTime\)/g, 'getLocalTimeFromUTC(appointmentTime)');
    changed = true;
  }
  if (content.includes('parseISO(dateString)')) {
    content = content.replace(/parseISO\(dateString\)/g, 'getLocalTimeFromUTC(dateString)');
    changed = true;
  }

  if (changed) {
    if (!content.includes('getLocalTimeFromUTC')) {
      console.log('Missed import logic');
    }

    if (content.includes('import { cn }')) {
      content = content.replace(/import { cn }/, 'import { cn, getLocalTimeFromUTC }');
    } else if (!content.includes('getLocalTimeFromUTC')) {
      content = "import { getLocalTimeFromUTC } from '@/lib/utils';\n" + content;
    } else if (!content.includes('import { getLocalTimeFromUTC }') && content.includes('import {')) {
        // If it doesn't have the import but uses it... wait, I'll just forcefully add it if not already there.
        if (!content.includes('getLocalTimeFromUTC }')) {
             content = "import { getLocalTimeFromUTC } from '@/lib/utils';\n" + content; 
        }
    }

    fs.writeFileSync(f, content);
    console.log('Updated ' + path.basename(f));
  }
});
