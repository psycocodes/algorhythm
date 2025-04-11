"use client";

import { useState, useEffect, useRef } from "react";
import { analyzeImage } from "@/ai/flows/analyze-image";
import { generateMusic } from "@/ai/flows/generate-music";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import * as Tone from 'tone';

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [musicParams, setMusicParams] = useState<{
    tempo: number;
    key: string;
    timeSignature: string;
    instruments: string[];
    notes: string[];
    melodyDescription: string;
  } | null>(null);
  const [analysis, setAnalysis] = useState<{
    dominantColors: string[];
    objects: string[];
    mood: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // Default tempo
  const [volume, setVolume] = useState(50); // Default volume
  const [error, setError] = useState<string | null>(null);
  const synth = useRef<Tone.Synth | null>(null);
  const sequence = useRef<Tone.Sequence | null>(null);

  useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
    return () => {
      if (synth.current) {
        synth.current.dispose();
      }
      if (sequence.current) {
        sequence.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (musicParams && synth.current) {
      if (sequence.current) {
        sequence.current.dispose();
      }
      sequence.current = new Tone.Sequence(
        (time, note) => {
          synth.current?.triggerAttackRelease(note, "8n", time);
        },
        musicParams.notes,
        "4n"
      ).start(0);
      Tone.Transport.bpm.value = musicParams.tempo;
    }
  }, [musicParams]);


  const handlePhotoUpload = async () => {
    setError(null);
    try {
      const imageAnalysis = await analyzeImage({ photoUrl });
      setAnalysis(imageAnalysis);

      const musicGeneration = await generateMusic({
        mood: imageAnalysis.mood,
        dominantColors: imageAnalysis.dominantColors,
        objects: imageAnalysis.objects,
      });

      setMusicParams(musicGeneration);
    } catch (e: any) {
      setError(e.message || "An error occurred during analysis and music generation.");
      console.error(e);
    }
  };

  const handlePlayPause = async () => {
    if (!musicParams) return;

    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      if (Tone.Transport.state === "stopped") {
        await Tone.start();
      }
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    // Placeholder for download logic
    alert("Download functionality not implemented yet.");
  };

  const handleTempoChange = (value: number[]) => {
    setTempo(value[0]);
    if (musicParams) {
      Tone.Transport.bpm.value = value[0];
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    Tone.Destination.volume.value = Tone.dbToGain(value[0] - 50); // Adjust as needed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl">AlgoRhythm</CardTitle>
          <CardDescription>
            Upload a photo and let AI create music inspired by it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex flex-col space-y-2">
            <Input
              type="url"
              placeholder="Enter photo URL"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <Button onClick={handlePhotoUpload} className="bg-primary text-primary-foreground hover:bg-primary/80">
              Analyze & Generate Music
            </Button>
          </div>

          {analysis && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Analysis Results:</h3>
              <p>Mood: {analysis.mood}</p>
              <p>Dominant Colors: {analysis.dominantColors.join(", ")}</p>
              <p>Objects: {analysis.objects.join(", ")}</p>
            </div>
          )}

          {musicParams && (
            <div className="space-y-4">
              <img src={photoUrl} alt="Uploaded" className="w-full rounded-md shadow-md" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Music Parameters:</h3>
                <p>Tempo: {musicParams.tempo} BPM</p>
                <p>Key: {musicParams.key}</p>
                <p>Time Signature: {musicParams.timeSignature}</p>
                <p>Instruments: {musicParams.instruments.join(", ")}</p>
                <p>Notes: {musicParams.notes.join(", ")}</p>
                <p>Melody Description: {musicParams.melodyDescription}</p>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={handlePlayPause}>
                  {isPlaying ? <Icons.pause /> : <Icons.play />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={handleDownload} className="bg-accent text-accent-foreground hover:bg-accent/80" disabled>
                  <Icons.download />
                  Download
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label htmlFor="tempo" className="text-sm font-medium">
                    Tempo:
                  </label>
                  <Slider
                    id="tempo"
                    defaultValue={[tempo]}
                    max={200}
                    min={50}
                    step={1}
                    onValueChange={handleTempoChange}
                  />
                  <span className="text-sm">{tempo} BPM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="volume" className="text-sm font-medium">
                    Volume:
                  </label>
                  <Slider
                    id="volume"
                    defaultValue={[volume]}
                    max={100}
                    min={0}
                    step={1}
                    onValueChange={(value) => handleVolumeChange}
                  />
                  <span className="text-sm">{volume}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
