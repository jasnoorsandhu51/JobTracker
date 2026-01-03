'use client'

import { useEffect, useRef } from 'react'

export default function GradientBackground() {
    const particlesContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const particlesContainer = particlesContainerRef.current
        if (!particlesContainer) return

        const particleCount = 80

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            createParticle()
        }

        function createParticle() {
            const particle = document.createElement('div')
            particle.className = 'particle'

            // Random size (small)
            const size = Math.random() * 3 + 1
            particle.style.width = `${size}px`
            particle.style.height = `${size}px`

            // Initial position
            resetParticle(particle)

            particlesContainer?.appendChild(particle)

            // Animate
            animateParticle(particle)
        }

        function resetParticle(particle: HTMLDivElement) {
            // Random position
            const posX = Math.random() * 100
            const posY = Math.random() * 100

            particle.style.left = `${posX}%`
            particle.style.top = `${posY}%`
            particle.style.opacity = '0'

            return {
                x: posX,
                y: posY
            }
        }

        function animateParticle(particle: HTMLDivElement) {
            // Initial position
            const pos = resetParticle(particle)

            // Random animation properties
            const duration = Math.random() * 10 + 10
            const delay = Math.random() * 5

            // Animate
            setTimeout(() => {
                particle.style.transition = `all ${duration}s linear`
                particle.style.opacity = String(Math.random() * 0.3 + 0.1)

                // Move in a slight direction
                const moveX = pos.x + (Math.random() * 20 - 10)
                const moveY = pos.y - Math.random() * 30 // Move upwards

                particle.style.left = `${moveX}%`
                particle.style.top = `${moveY}%`

                // Reset after animation completes
                setTimeout(() => {
                    animateParticle(particle)
                }, duration * 1000)
            }, delay * 1000)
        }

        // Mouse interaction
        const handleMouseMove = (e: MouseEvent) => {
            const mouseX = (e.clientX / window.innerWidth) * 100
            const mouseY = (e.clientY / window.innerHeight) * 100

            // Create temporary particle
            const particle = document.createElement('div')
            particle.className = 'particle'

            // Small size
            const size = Math.random() * 4 + 2
            particle.style.width = `${size}px`
            particle.style.height = `${size}px`

            // Position at mouse
            particle.style.left = `${mouseX}%`
            particle.style.top = `${mouseY}%`
            particle.style.opacity = '0.6'

            particlesContainer?.appendChild(particle)

            // Animate outward
            setTimeout(() => {
                particle.style.transition = 'all 2s ease-out'
                particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`
                particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`
                particle.style.opacity = '0'

                // Remove after animation
                setTimeout(() => {
                    particle.remove()
                }, 2000)
            }, 10)

            // Subtle movement of gradient spheres
            const spheres = document.querySelectorAll('.gradient-sphere')
            const moveX = (e.clientX / window.innerWidth - 0.5) * 5
            const moveY = (e.clientY / window.innerHeight - 0.5) * 5

            spheres.forEach(sphere => {
                (sphere as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`
            })
        }

        document.addEventListener('mousemove', handleMouseMove)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <>
            <div className="gradient-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
                <div className="glow"></div>
                <div className="grid-overlay"></div>
                <div className="noise-overlay"></div>
                <div className="particles-container" ref={particlesContainerRef}></div>
            </div>

            <style jsx global>{`
                .gradient-background {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                .gradient-sphere {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    transition: transform 0.3s ease-out;
                }

                .sphere-1 {
                    width: 40vw;
                    height: 40vw;
                    background: linear-gradient(40deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.2));
                    top: -10%;
                    left: -10%;
                    animation: float-1 15s ease-in-out infinite alternate;
                }

                .sphere-2 {
                    width: 45vw;
                    height: 45vw;
                    background: linear-gradient(240deg, rgba(126, 34, 206, 0.4), rgba(168, 85, 247, 0.2));
                    bottom: -20%;
                    right: -10%;
                    animation: float-2 18s ease-in-out infinite alternate;
                }

                .sphere-3 {
                    width: 30vw;
                    height: 30vw;
                    background: linear-gradient(120deg, rgba(168, 85, 247, 0.3), rgba(192, 132, 252, 0.15));
                    top: 60%;
                    left: 20%;
                    animation: float-3 20s ease-in-out infinite alternate;
                }

                @keyframes float-1 {
                    0% {
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        transform: translate(30px, 40px) scale(1.1);
                    }
                }

                @keyframes float-2 {
                    0% {
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        transform: translate(-40px, -30px) scale(1.15);
                    }
                }

                @keyframes float-3 {
                    0% {
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        transform: translate(20px, -50px) scale(1.05);
                    }
                }

                .glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
                    transform: translate(-50%, -50%);
                    animation: pulse 8s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.5;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                }

                .grid-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    opacity: 0.3;
                }

                .noise-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.02;
                    pointer-events: none;
                }

                .particles-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .particle {
                    position: absolute;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.8), rgba(192, 132, 252, 0.4));
                    border-radius: 50%;
                    pointer-events: none;
                    box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
                }
            `}</style>
        </>
    )
}
