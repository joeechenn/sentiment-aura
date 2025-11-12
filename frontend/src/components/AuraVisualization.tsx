import React, { useRef } from 'react';
import Sketch from 'react-p5';

interface AuraVisualizationProps {
    sentiment: number;
    keywords: string[];
}

interface Particle {
    pos: any;
    vel: any;
    acc: any;
    maxSpeed: number;
    prevPos: any;
    zOffset: number;
    layer: number;
}

export function AuraVisualization({ sentiment, keywords }: AuraVisualizationProps) {
    const particlesRef = useRef<Particle[]>([]);
    const numParticles = 25000;
    const numLayers = 5;
    const noiseScale = 0.004;
    const noiseStrength = 3;
    const respawnThreshold = 0.1;

    const setup = (p5: any, canvasParentRef: Element) => {
        p5.createCanvas(window.innerWidth, window.innerHeight).parent(canvasParentRef);
        
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < numParticles; i++) {
                particlesRef.current.push({
                    pos: p5.createVector(
                        p5.random(p5.width),
                        p5.random(p5.height)
                    ),
                    vel: p5.createVector(0, 0),
                    acc: p5.createVector(0, 0),
                    maxSpeed: p5.random(0.7, 1.5),
                    prevPos: p5.createVector(0, 0),
                    zOffset: p5.random(1000),
                    layer: Math.floor(p5.random(numLayers))
                });
            }
        }
        
        p5.background(255);
    };

    const draw = (p5: any) => {
        p5.fill(255, 255, 255, 1.7);
        p5.noStroke();
        p5.rect(0, 0, p5.width, p5.height);

        const normalizedSentiment = (sentiment + 1) / 2;
        
        let r: number, g: number, b: number;
        if (normalizedSentiment < 0.5) {
            r = p5.map(normalizedSentiment, 0, 0.5, 50, 150);
            g = p5.map(normalizedSentiment, 0, 0.5, 50, 50);
            b = p5.map(normalizedSentiment, 0, 0.5, 200, 200);
        } else {
            r = p5.map(normalizedSentiment, 0.5, 1, 150, 255);
            g = p5.map(normalizedSentiment, 0.5, 1, 50, 180);
            b = p5.map(normalizedSentiment, 0.5, 1, 200, 50);
        }

        const keywordEnergy = p5.map(keywords.length, 0, 8, 0, 1);
        const keywordComplexity = 1 + (keywordEnergy * 0.5);
        const flowSpeed = p5.map(Math.abs(sentiment), 0, 1, 1, 1.5) * (1 + keywordEnergy * 0.3);
        const dynamicNoiseScale = noiseScale * keywordComplexity;

        particlesRef.current.forEach((particle) => {
            particle.prevPos.set(particle.pos);

            const angle = p5.noise(
                particle.pos.x * dynamicNoiseScale,
                particle.pos.y * dynamicNoiseScale,
                p5.frameCount * 0.002 + particle.zOffset
            ) * p5.TWO_PI * noiseStrength * flowSpeed;

            const force = p5.createVector(Math.cos(angle), Math.sin(angle));
            force.mult(0.5);
            
            const jitterAmount = 0.3 * (1 + keywordEnergy * 0.4);
            force.add(p5.createVector(
                p5.random(-jitterAmount, jitterAmount), 
                p5.random(-jitterAmount, jitterAmount)
            ));
            
            particle.acc.add(force);

            particle.vel.add(particle.acc);
            particle.vel.limit(particle.maxSpeed);
            particle.pos.add(particle.vel);
            particle.acc.mult(0);

            if (particle.vel.mag() < respawnThreshold && p5.random() < 0.001) {
                particle.pos.set(p5.random(p5.width), p5.random(p5.height));
                particle.vel.set(0, 0);
            }

            if (particle.pos.x < 0) particle.pos.x = p5.width;
            if (particle.pos.x > p5.width) particle.pos.x = 0;
            if (particle.pos.y < 0) particle.pos.y = p5.height;
            if (particle.pos.y > p5.height) particle.pos.y = 0;

            const layerIntensity = p5.map(particle.layer, 0, numLayers - 1, 0.9, 1.1);
            
            p5.noStroke();
            const particleR = p5.constrain(r * layerIntensity, 0, 255);
            const particleG = p5.constrain(g * layerIntensity, 0, 255);
            const particleB = p5.constrain(b * layerIntensity, 0, 255);
            
            const layerAlpha = p5.map(particle.layer, 0, numLayers - 1, 40, 60);
            
            p5.fill(particleR, particleG, particleB, layerAlpha);
            p5.circle(particle.pos.x, particle.pos.y, 7);
        });
    };

    const windowResized = (p5: any) => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    return (
        <div className="fixed inset-0 z-0">
            <Sketch setup={setup} draw={draw} windowResized={windowResized} />
        </div>
    );
}