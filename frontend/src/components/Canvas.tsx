import { useRef, useEffect } from "react";

const imagePaths = ["/fries.jpg", "/guy.jpg"];

interface FallingImage {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let imageCount = 0;
    const images: HTMLImageElement[] = [];
    imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        imageCount += 1;
        if (imageCount === imagePaths.length) {
          animate();
          initializeFallingImages();
        }
      };
      images.push(img);
    });

    const imageScale = 0.5;
    function createFallingImage(): FallingImage {
      const img = images[Math.floor(Math.random() * images.length)];
      return {
        img,
        x: Math.random() * (window.innerWidth - img.width),
        y: -img.height * imageScale,
        width: img.width * imageScale,
        height: img.height * imageScale,
        speed: 2 + Math.random() * 2,
      };
    }

    // Initialize a fixed number of falling images
    const totalImageCount = 2;
    let fallingImages: FallingImage[] = [];
    function initializeFallingImages() {
      fallingImages = Array.from(
        { length: totalImageCount },
        createFallingImage
      );
    }

    function animate() {
      requestAnimationFrame(animate);
      if (!ctx) return;
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < fallingImages.length; i++) {
        const image = fallingImages[i];
        image.y += image.speed;

        if (image.y > canvas.height + image.img.height) {
          fallingImages[i] = createFallingImage();
        }

        ctx.drawImage(image.img, image.x, image.y, image.height, image.width);
      }
    }

    function handleClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Iterate backwards so we check the topmost image first
      for (let i = fallingImages.length - 1; i >= 0; i--) {
        const obj = fallingImages[i];
        if (
          clickX >= obj.x &&
          clickX <= obj.x + obj.width &&
          clickY >= obj.y &&
          clickY <= obj.y + obj.height
        ) {
          console.log("Topmost image clicked, replacing it.");
          fallingImages[i] = createFallingImage();
          break; // stop after replacing the topmost one
        }
      }
    }
    document.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1, // behind other content
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default Canvas;
