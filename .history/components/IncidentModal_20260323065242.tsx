import React from 'react'

interface IncidentModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (incidentType: string) => Promise<void>
  isLoading: boolean
}

const INCIDENT_TYPES = [
  { id: 'medical', label: 'Medical Emergency', icon: '🚑' },
  { id: 'vehicle', label: 'Vehicle Accident', icon: '🚗' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'others', label: 'Other Incidents', icon: '⚠️' },
]

export const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  isLoading,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Select Incident Type
          </h2>

          <div className="space-y-3">
            {INCIDENT_TYPES.map((incident) => (
              <button
                key={incident.id}
                onClick={() => onSelect(incident.id)}
                disabled={isLoading}
                className="w-full p-4 flex items-center gap-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {incident.icon}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-primary">
                    {incident.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
