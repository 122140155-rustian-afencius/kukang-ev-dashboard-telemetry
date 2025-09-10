import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { IconGauge, IconHistory, IconSettings, IconUserBolt, IconLogout } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const [open, setOpen] = useState(false);
  const links = useMemo(
    () => [
      { label: 'Dashboard', href: '/dashboard', icon: <IconGauge className="h-5 w-5 shrink-0 text-neutral-200" /> },
      { label: 'History', href: '/history', icon: <IconHistory className="h-5 w-5 shrink-0 text-neutral-200" /> },
      { label: 'Profile', href: '#', icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-200" /> },
      { label: 'Settings', href: '#', icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-200" /> },
    ],
    []
  );

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800 h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <SidebarLink
              link={{
                label: 'Technical Manager',
                href: '#',
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
            <Link
              href="/logout"
              method="post"
              as="button"
              aria-label="Logout"
              title="Logout"
              className="ml-auto rounded-md p-1.5 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              <IconLogout className="h-5 w-5" />
            </Link>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">{children}</div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-black dark:text-white">
        KUKANG EV ITERA
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
