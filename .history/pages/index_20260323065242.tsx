import React, { useState } from 'react'
import Head from 'next/head'
import { IncidentModal } from '../components/IncidentModal'
import { SuccessMessage } from '../components/SuccessMessage'
import { getLocation } from '../lib/geolocation'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleReportClick = () => {
    setIsModalOpen(true)
  }

  const handleIncidentSelect = async (incidentType: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // Get current location
      const location = await getLocation()

      // Submit to backend API
      const response = await fetch('/api/submit-incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidentType,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit incident')
      }

      // Show success message and close modal
      setShowSuccess(true)
      setIsModalOpen(false)

      // Reset after delay
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Failed to report incident'
      setErrorMessage(msg)
      console.error('Error reporting incident:', error)

      // Show error alert
      alert(`Error: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Emergency Incident Reporter</title>
        <meta
          name="description"
          content="Report emergencies and incidents instantly with location tracking"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Emergency Alert
              </h1>
              <p className="text-blue-100 text-lg mb-6">
                Quick incident reporting system
              </p>
            </div>

            {/* Main Button - English */}
            <button
              onClick={handleReportClick}
              disabled={isLoading}
              className="w-full bg-white text-primary font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              Report an Incident
            </button>

            {/* Main Button - Hindi */}
            <button
              onClick={handleReportClick}
              disabled={isLoading}
              className="w-full bg-red-600 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              दुर्घटना के बारे में सूचित करें!!
            </button>

            {/* Info Section */}
            <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-6 text-white">
              <p className="text-sm leading-relaxed">
                ℹ️ Your location will be automatically captured and shared with
                emergency responders. Location permissions required.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 text-white text-xs opacity-75">
              <p>Emergency Response System v1.0</p>
              <p>Your location data helps responders reach you faster</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleIncidentSelect}
        isLoading={isLoading}
      />

      {/* Success Message */}
      <SuccessMessage
        isVisible={showSuccess}
        message="Incident reported! Responders have been notified with your location."
        onDismiss={() => setShowSuccess(false)}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
    </>
  )
}
