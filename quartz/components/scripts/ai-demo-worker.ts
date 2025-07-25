// Web Worker for running AI models in the background
// This prevents blocking the main UI thread

interface TransformersModule {
  pipeline: (task: string, model: string, options?: PipelineOptions) => Promise<Pipeline>;
  env: {
    allowLocalModels: boolean;
    remoteURL: string;
  };
}

interface PipelineOptions {
  progress_callback?: (progress: ProgressInfo) => void;
}

interface ProgressInfo {
  progress: number;
}

interface Pipeline {
  (input: string): Promise<any>;
}

interface WorkerMessage {
  type: 'loadModel' | 'runInference';
  data: LoadModelData | RunInferenceData;
}

interface LoadModelData {
  task: string;
  model: string;
}

interface RunInferenceData {
  input: string;
}

interface WorkerResponse {
  type: 'status' | 'progress' | 'modelLoaded' | 'result' | 'error';
  message?: string;
  progress?: number;
  success?: boolean;
  data?: any;
  error?: string;
}

let pipeline: Pipeline | null = null;

// Dynamic import for Transformers.js
async function loadTransformers(): Promise<{ createPipeline: TransformersModule['pipeline'] }> {
  try {
    const { pipeline: createPipeline, env }: TransformersModule = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
    
    // Configure environment for browser
    env.allowLocalModels = false;
    env.remoteURL = 'https://huggingface.co/';
    
    return { createPipeline };
  } catch (error) {
    console.error('Failed to load Transformers.js:', error);
    throw error;
  }
}

self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'loadModel':
        self.postMessage({ type: 'status', message: 'Loading Transformers.js...' } as WorkerResponse);
        const { createPipeline } = await loadTransformers();
        
        self.postMessage({ type: 'status', message: 'Creating pipeline...' } as WorkerResponse);
        const loadModelData = data as LoadModelData;
        pipeline = await createPipeline(loadModelData.task, loadModelData.model, {
          progress_callback: (progress: ProgressInfo) => {
            self.postMessage({ 
              type: 'progress', 
              progress: progress.progress,
              message: `Loading model: ${Math.round(progress.progress * 100)}%`
            } as WorkerResponse);
          }
        });
        
        self.postMessage({ type: 'modelLoaded', success: true } as WorkerResponse);
        break;
        
      case 'runInference':
        if (!pipeline) {
          throw new Error('Model not loaded');
        }
        
        self.postMessage({ type: 'status', message: 'Running inference...' } as WorkerResponse);
        const runInferenceData = data as RunInferenceData;
        const result = await pipeline(runInferenceData.input);
        self.postMessage({ type: 'result', data: result } as WorkerResponse);
        break;
        
      default:
        throw new Error('Unknown message type');
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    } as WorkerResponse);
  }
});