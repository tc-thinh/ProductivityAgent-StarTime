"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function UnderConstruction() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="p-6 text-center max-w-md shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🚧 Under Construction 🚧</h1>
        <p className="text-gray-700 mb-3">
          We're currently working on this page. Please check back later!
        </p>
        <Button
          color="primary"
          size="lg"
          className='p-2'
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Back to your AI Assistant
        </Button>
      </Card>
    </div>
  );
}

export default UnderConstruction
