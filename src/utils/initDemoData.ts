import React from 'react';
import { __seedFixsyMessagesOnce } from '../messages/MessagesContext';
import { seedAuthUsersOnce, seedManagementUsersOnce, setAllAuthPasswords, pruneUsersToCore, seedDemoUsersAndMail, ensureCoreAccounts, ensureSupportToAdminMail, ensureDemoUsersGmailPresent } from './seedUsers';
import { seedItemsOnce, seedPurchasesOnce, seedPurchasesForEmails } from './seedStore';
import { seedInventoryFromCsvOnce, patchInventoryImagesFromCsv, overwriteInventoryImagesFromCsv } from './inventory';

let initialized = false;

export function useInitDemoData() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (initialized) { setReady(true); return; }
    initialized = true;
    const run = async () => {
      try { __seedFixsyMessagesOnce(); } catch {}
      try { seedAuthUsersOnce(); } catch {}
      try { seedManagementUsersOnce(); } catch {}
      try { setAllAuthPasswords('12345678'); } catch {}
      try { pruneUsersToCore(['santiago@admin.fixsy.com','matias@soporte.fixsy.com','lucas.morales@gmail.com','valentina.rojas@gmail.com','diego.castro@gmail.com']); } catch {}
      try { ensureCoreAccounts(); } catch {}
      try { ensureDemoUsersGmailPresent(); } catch {}
      try { await seedInventoryFromCsvOnce(); } catch {}
      try { await patchInventoryImagesFromCsv(); await overwriteInventoryImagesFromCsv(); } catch {}
      try { seedItemsOnce(); } catch {}
      try { seedPurchasesOnce(); } catch {}
      try { seedPurchasesForEmails(['lucas.morales@gmail.com','valentina.rojas@gmail.com','diego.castro@gmail.com']); } catch {}
      try { seedDemoUsersAndMail(); } catch {}
      try { ensureSupportToAdminMail(); } catch {}
      if (mounted) setReady(true);
    };
    run();
    return () => { mounted = false; };
  }, []);

  return ready;
}
