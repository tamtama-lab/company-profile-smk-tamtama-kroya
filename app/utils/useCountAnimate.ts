// utils/useCountUp.js (versi dengan reset capabilities)
import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountUpOptions {
  threshold?: number;
  triggerOnce?: boolean;
  root?: Element | null;
  rootMargin?: string;
  autoStart?: boolean;
}

export default function useCountUp(
  targetValues: Record<string, number> | null,
  duration = 2000,
  options: UseCountUpOptions = {}
) {
  const [currentValues, setCurrentValues] = useState<Record<string, number>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);
  const animationRef = useRef<number | null>(null);

  const {
    threshold = 0.1,
    triggerOnce = true,
    root = null,
    rootMargin = "0px",
    autoStart = true, // Mulai otomatis ketika visible
  } = options;

  // Setup Intersection Observer
  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
            setIsVisible(true);
            setHasAnimated(true);
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, root, rootMargin }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [threshold, triggerOnce, root, rootMargin, hasAnimated]);

  // Function untuk start animation
  const startAnimation = useCallback(() => {
    if (!targetValues || typeof targetValues !== "object") return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let currentFrame = 0;

    const initialValues = Object.keys(targetValues).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);

    const animate = () => {
      currentFrame++;
      const progress = Math.min(currentFrame / totalFrames, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Easing function

      const newValues = Object.keys(targetValues).reduce((acc, key) => {
        const startValue = initialValues[key];
        const endValue = targetValues[key];
        acc[key] = Math.floor(
          startValue + easeOutQuart * (endValue - startValue)
        );
        return acc;
      }, {} as Record<string, number>);

      setCurrentValues(newValues);

      if (currentFrame < totalFrames) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Pastikan nilai akhir tepat
        setCurrentValues(targetValues);
      }
    };

    setCurrentValues(initialValues); // Reset ke 0
    animationRef.current = requestAnimationFrame(animate);
  }, [targetValues, duration]);

  // Function untuk reset animation
  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCurrentValues({});
    setHasAnimated(false);
    setIsVisible(false);
  }, []);

  // Auto start animation when visible
  useEffect(() => {
    if (autoStart && isVisible && targetValues) {
      startAnimation();
    }
  }, [autoStart, isVisible, targetValues, startAnimation]);

  return {
    currentValues,
    elementRef,
    startAnimation,
    resetAnimation,
    isVisible,
  };
}
