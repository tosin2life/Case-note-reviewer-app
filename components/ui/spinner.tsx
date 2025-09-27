'use client'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'medical' | 'pulse'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

function SpinnerComponent({
  size = 'md',
  className,
  variant = 'default',
}: SpinnerProps) {
  if (variant === 'medical') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        {/* Medical cross spinner */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='relative'>
            {/* Outer ring */}
            <div
              className={cn(
                'animate-spin rounded-full border-2 border-blue-200',
                sizeClasses[size]
              )}
            ></div>
            {/* Inner cross */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex flex-col items-center justify-center'>
                <div className='w-1 h-1 bg-blue-600 rounded-full animate-pulse'></div>
                <div className='w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-75'></div>
                <div className='w-1 h-1 bg-blue-600 rounded-full animate-pulse delay-150'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex space-x-1', className)}>
        <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
        <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75'></div>
        <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150'></div>
      </div>
    )
  }

  // Default modern spinner
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-blue-200 border-t-blue-600',
          sizeClasses[size]
        )}
      ></div>
    </div>
  )
}

// Full page loading spinner
export function FullPageSpinner({
  variant = 'medical',
}: {
  variant?: 'default' | 'medical' | 'pulse'
}) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <SpinnerComponent
          size='xl'
          variant={variant}
          className='mx-auto mb-4'
        />
        <p className='text-gray-600 text-sm'>Loading...</p>
      </div>
    </div>
  )
}

// Button spinner
export function ButtonSpinner({ className }: { className?: string }) {
  return <SpinnerComponent size='sm' className={cn('mr-2', className)} />
}

// Default export
export default SpinnerComponent
