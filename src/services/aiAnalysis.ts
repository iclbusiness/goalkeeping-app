/**
 * AI Video Analysis Service
 *
 * This module is the integration point for automatic stat extraction from video footage.
 * When you're ready to integrate Veo (or any other provider), implement the
 * AIAnalysisService interface and swap out the stub below.
 *
 * Suggested integration steps:
 *  1. Upload video to your analysis API (e.g. Veo, Sportscode, or a custom CV model)
 *  2. Poll or webhook for completion
 *  3. Map the returned event data to the StatEvent types in src/types/index.ts
 *  4. Call addEventsFromVideo() in AppContext to merge AI events into the match
 */

import { StatEvent, VideoAnalysisOptions, VideoAnalysisResult } from '../types';

export interface AIAnalysisService {
  analyzeVideo(videoUri: string, options?: VideoAnalysisOptions): Promise<VideoAnalysisResult>;
  isAvailable(): boolean;
}

// ─── Stub — replace this class with a real implementation ───────────────────

export class VeoAnalysisService implements AIAnalysisService {
  isAvailable(): boolean {
    return false; // flip to true when implemented
  }

  async analyzeVideo(
    _videoUri: string,
    _options?: VideoAnalysisOptions
  ): Promise<VideoAnalysisResult> {
    // TODO: Replace with real Veo API call
    //
    // Example outline:
    //   const response = await fetch('https://api.veo.co/v1/analyze', {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${VEO_API_KEY}` },
    //     body: JSON.stringify({ videoUrl: videoUri, ...options }),
    //   });
    //   const data = await response.json();
    //   return mapVeoResponseToResult(data);

    throw new Error(
      'AI video analysis is not yet implemented. ' +
        'Add your Veo (or other provider) credentials and implement this method.'
    );
  }
}

// ─── Helper: merge AI events into existing match events ─────────────────────

export function mergeAiEvents(
  existingEvents: StatEvent[],
  aiResult: VideoAnalysisResult
): StatEvent[] {
  let counter = Date.now();
  const newEvents: StatEvent[] = aiResult.events.map((e) => ({
    ...e,
    id: `ai_${counter++}`,
  }));
  // Deduplicate by matchTime ± 2 seconds (rough guard)
  const merged = [...existingEvents];
  for (const ai of newEvents) {
    const duplicate = existingEvents.some(
      (ex) => ex.type === ai.type && Math.abs(ex.matchTime - ai.matchTime) <= 2
    );
    if (!duplicate) merged.push(ai);
  }
  return merged.sort((a, b) => a.matchTime - b.matchTime);
}

export const aiService: AIAnalysisService = new VeoAnalysisService();
