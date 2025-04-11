"use client";

import { useState } from "react";
import { analyzeImage } from "@/ai/flows/analyze-image";
import { generateMusic } from "@/ai/flows/generate-music";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [analysis, setAnalysis] = useState<{
    dominantColors: string[];
    objects: string[];
    mood: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120); // Default tempo
  const [volume, setVolume] = useState(50); // Default volume
  const [error, setError] = useState<string | null>(null);


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

      // Placeholder for music generation logic - replace with actual music generation
      setMusicUrl("https://www.w3schools.com/html/horse.ogg"); // Replace with generated music URL
    } catch (e: any) {
      setError(e.message || "An error occurred during analysis and music generation.");
      console.error(e);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    // Placeholder for download logic
    alert("Download functionality not implemented yet.");
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

          {musicUrl && (
            <div className="space-y-4">
              <img src={photoUrl} alt="Uploaded" className="w-full rounded-md shadow-md" />
              <audio src={musicUrl} controls autoPlay={isPlaying} className="w-full">
                Your browser does not support the audio element.
              </audio>
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={handlePlayPause}>
                  {isPlaying ? <Icons.pause /> : <Icons.play />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button onClick={handleDownload} className="bg-accent text-accent-foreground hover:bg-accent/80">
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
                    onValueChange={(value) => setTempo(value[0])}
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
                    onValueChange={(value) => setVolume(value[0])}
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
