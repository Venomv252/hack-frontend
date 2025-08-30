import React from 'react'

const ActivityLog = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Log</h1>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <p className="text-sm text-gray-900">Device sync completed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-900">Location updated</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityLog