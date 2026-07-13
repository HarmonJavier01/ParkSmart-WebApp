import React from 'react';

// Single Lot Card Skeleton
export const LotCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-5 space-y-4">
      {/* Image Placeholder */}
      <div className="h-48 w-full bg-slate-200 rounded-xl animate-pulse" />
      
      {/* Content Placeholder */}
      <div className="space-y-3 flex-grow">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded-md w-2/3 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-md w-12 animate-pulse" />
        </div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2 animate-pulse" />
        
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-md w-20 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-md w-16 animate-pulse" />
        </div>

        {/* Progress Bar Placeholder */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-200 rounded-md w-14 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded-md w-12 animate-pulse" />
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 animate-pulse" />
        </div>
      </div>

      {/* Button Placeholder */}
      <div className="h-10 bg-slate-200 rounded-xl w-full animate-pulse" />
    </div>
  );
};

// Slot Grid Skeleton (Placeholder for slot grid area)
export const SlotGridSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-slate-200 rounded-md w-48 animate-pulse mb-4" />
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square bg-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
};

// Search Page Skeleton
export const ParkingSearchSkeleton = ({ isTab = false }) => {
  return (
    <div className={isTab ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
      {!isTab && <div className="h-8 bg-slate-200 rounded-md w-48 animate-pulse mb-6" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sidebar Skeletons */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
          {/* Search bar placeholder */}
          <div className="h-10 bg-slate-200 rounded-lg w-full animate-pulse" />
          
          {/* Filter options placeholder */}
          <div className="flex gap-3">
            <div className="h-6 bg-slate-200 rounded-md w-24 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded-md w-28 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded-md w-28 animate-pulse" />
          </div>

          {/* Lot Cards list placeholder */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <LotCardSkeleton />
            <LotCardSkeleton />
          </div>
        </div>

        {/* Map Panel Placeholder */}
        <div className="lg:col-span-2 h-full rounded-xl bg-slate-200 border border-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

// Lot Detail Page Skeleton
export const LotDetailPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button placeholder */}
      <div className="h-5 bg-slate-200 rounded-md w-32 animate-pulse mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Slot grid & map */}
        <div className="lg:col-span-2 space-y-6">
          <SlotGridSkeleton />
          
          <div className="h-[380px] bg-slate-200 rounded-2xl animate-pulse" />
        </div>

        {/* Right Section: Details sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-col space-y-6 pb-6">
            {/* Header/Cover Photo placeholder */}
            <div className="h-48 bg-slate-200 animate-pulse" />
            
            {/* Info panel placeholders */}
            <div className="px-6 space-y-4">
              <div className="h-7 bg-slate-200 rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-md w-1/3 animate-pulse" />
              
              <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse" />
              
              <hr className="border-gray-100" />
              
              {/* Quick actions row placeholder */}
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-2 bg-slate-200 rounded-md w-8 animate-pulse" />
                  </div>
                ))}
              </div>
              
              <hr className="border-gray-100" />

              {/* Text rows placeholders */}
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded-md w-2/3 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded-md w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
