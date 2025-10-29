"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckAndFixPage() {
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      
      if (response.ok) {
        setDbInfo(data)
        console.log('Database info:', data)
      } else {
        setError(data.error || 'Failed to check database')
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const fixDatabase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/fix-services-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('✅ Database fixed!')
        // Refresh database info
        await checkDatabase()
      } else {
        setError(data.error || 'Fix failed')
        alert('❌ Fix failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      const errorMsg = 'Fix error: ' + (err instanceof Error ? err.message : 'Unknown error')
      setError(errorMsg)
      alert('❌ ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Check & Fix Database</CardTitle>
            <CardDescription>
              Check the actual database structure and fix it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={checkDatabase} disabled={isLoading}>
                {isLoading ? 'Loading...' : '🔄 Check Database'}
              </Button>
              <Button onClick={fixDatabase} disabled={isLoading} variant="outline">
                {isLoading ? 'Fixing...' : '🔧 Fix Database'}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800">❌ Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {dbInfo && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📊 Database Status:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Has title_* columns:</strong> {dbInfo.hasTitleColumns ? '❌ YES' : '✅ NO'}
                    </div>
                    <div>
                      <strong>Has name_* columns:</strong> {dbInfo.hasNameColumns ? '✅ YES' : '❌ NO'}
                    </div>
                    <div>
                      <strong>Has image_url:</strong> {dbInfo.hasImageUrl ? '✅ YES' : '❌ NO'}
                    </div>
                    <div>
                      <strong>Needs Fix:</strong> {dbInfo.hasTitleColumns || !dbInfo.hasImageUrl ? '❌ YES' : '✅ NO'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">📋 Current Table Structure:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {dbInfo.columns?.map((col: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div className="font-medium">{col.column_name}</div>
                        <div className="text-gray-600">{col.data_type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {dbInfo.createError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">❌ Create Error:</h3>
                    <p className="text-red-700 text-sm">{dbInfo.createError}</p>
                  </div>
                )}

                {dbInfo.sampleService && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">📄 Sample Service:</h3>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(dbInfo.sampleService, null, 2)}
                    </pre>
                  </div>
                )}

                {(dbInfo.hasTitleColumns || !dbInfo.hasImageUrl) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Database Needs Fix:</h3>
                    <p className="text-yellow-700">
                      The database has the wrong column names. Click "Fix Database" to resolve this.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
