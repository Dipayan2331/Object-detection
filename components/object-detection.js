'use client'
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from '@/utils/renderpredictions';

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let detectInterval;

  const runCoco = async () => {
    try {
      setIsLoading(true);
      const net = await cocoSSDLoad();
      setIsLoading(false);

      detectInterval = setInterval(() => {
        runObjectDetection(net);
      }, 100); // Increase the interval to reduce load
    } catch (error) {
      console.error("Error loading COCO-SSD model:", error);
    }
  };

  const runObjectDetection = async (net) => {
    if (
      canvasRef.current &&
      webcamRef.current &&
      webcamRef.current.video?.readyState === 4
    ) {
      try {
        const video = webcamRef.current.video;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        const detectedObjects = await net.detect(video, undefined, 0.6);
        const context = canvasRef.current.getContext("2d");
        renderPredictions(detectedObjects, context);
      } catch (error) {
        console.error("Error during object detection:", error);
      }
    }
  };

  useEffect(() => {
    runCoco();

    return () => {
      clearInterval(detectInterval);
    };
  }, []);

  return (
    <div className='mt-8'>
      {isLoading ? (
        <div className='gradient-text'>Loading AI Model</div>
      ) : (
        <div className='relative flex justify-center items-center gradient p-1.5 rounded-md'>
          <Webcam ref={webcamRef} className="rounded-md w-full lg:h-[720px]" muted />
          <canvas ref={canvasRef} className='absolute top-0 left-0 z-99999 w-full lg:h-[720px]' />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
