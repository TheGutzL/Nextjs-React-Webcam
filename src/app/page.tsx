"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import WebCam from "react-webcam";

export default function HomePage() {
  const [imageSrc, setImageSrc] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState<"user" | "enviroment">(
    "enviroment"
  );
  const [capturing, setCapturing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const handleDevices = useCallback((mediaDevices) => {
    setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, []);

  function capture() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  }

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();

      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className="flex h-screen flex-col md:flex-row p-10 md:p-0 gap-y-2 items-center justify-center w-full">
      <div>
        <WebCam
          audio={false}
          height={360}
          width={720}
          screenshotFormat="image/png"
          ref={webcamRef}
          videoConstraints={{
            height: 1080,
            width: 1920,
            facingMode: facingMode,
            deviceId: selectedDevice,
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          onClick={capture}
        >
          Capture photo
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          onClick={() =>
            setFacingMode(facingMode === "user" ? "enviroment" : "user")
          }
        >
          Change Camera
        </button>

        {capturing ? (
          <button
            onClick={handleStopCaptureClick}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Stop capturing
          </button>
        ) : (
          <button
            onClick={handleStartCaptureClick}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Start capturing
          </button>
        )}

        {devices.length > 0 && (
          <select
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {devices.map((device, index) => (
              <option
                key={index}
                value={device.deviceId}
              >
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>
      {imageSrc && (
        <img
          src={imageSrc}
          className="w-1/2 h-1/2 md:w-1/4 md:h-1/4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
        />
      )}

      <div className="flex flex-col items-center">
        {recordedChunks.length > 0 && (
          <video
            controls
            className="w-1/2 h-1/2 md:w-1/4 md:h-1/4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <source
              src={URL.createObjectURL(
                new Blob(recordedChunks, { type: "video/webm" })
              )}
            />
          </video>
        )}

        <div
          className="flex"
        >
          {recordedChunks.length > 0 && (
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Download
            </button>
          )}

          {recordedChunks.length > 0 && (
            <button
              onClick={() => setRecordedChunks([])}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mt-4 ml-2 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
