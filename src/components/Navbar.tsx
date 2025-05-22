
import React from 'react';
import { Calendar, User, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TabType } from '@/types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center">
      <Button
        variant={activeTab === TabType.EXPLORE ? "default" : "ghost"}
        className={`flex flex-col items-center px-4 py-2 ${
          activeTab === TabType.EXPLORE ? "text-primary" : "text-gray-500"
        }`}
        onClick={() => setActiveTab(TabType.EXPLORE)}
      >
        <Search size={20} />
        <span className="text-xs mt-1">Explore</span>
      </Button>

      <Button
        variant={activeTab === TabType.MY_EVENTS ? "default" : "ghost"}
        className={`flex flex-col items-center px-4 py-2 ${
          activeTab === TabType.MY_EVENTS ? "text-primary" : "text-gray-500"
        }`}
        onClick={() => setActiveTab(TabType.MY_EVENTS)}
      >
        <Calendar size={20} />
        <span className="text-xs mt-1">My Events</span>
      </Button>

      <Button
        variant={activeTab === TabType.PROFILE ? "default" : "ghost"}
        className={`flex flex-col items-center px-4 py-2 ${
          activeTab === TabType.PROFILE ? "text-primary" : "text-gray-500"
        }`}
        onClick={() => setActiveTab(TabType.PROFILE)}
      >
        <User size={20} />
        <span className="text-xs mt-1">Profile</span>
      </Button>
    </div>
  );
};

export default Navbar;
