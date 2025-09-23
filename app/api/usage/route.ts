import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats, checkRateLimit, simulateUsage, clearUsageData } from '@/lib/usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    const stats = getUsageStats(userId);
    const rateLimit = checkRateLimit(userId);
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        rateLimit,
        limits: {
          dailyLimit: 1500, // Gemini free tier daily limit
          minuteLimit: 15,  // Gemini free tier minute limit
        }
      }
    });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve usage statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = 'default', requests = 1 } = body;
    
    switch (action) {
      case 'simulate':
        simulateUsage(userId, requests);
        return NextResponse.json({
          success: true,
          message: `Simulated ${requests} requests for user ${userId}`,
          data: getUsageStats(userId)
        });
        
      case 'clear':
        clearUsageData(userId);
        return NextResponse.json({
          success: true,
          message: `Cleared usage data for user ${userId}`,
          data: getUsageStats(userId)
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use "simulate" or "clear"'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Usage tracking action error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to execute usage tracking action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
