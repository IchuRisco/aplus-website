import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Phone, Mail, MapPin, CheckCircle, Star, Users, Award, Clock, Volume2, VolumeX } from 'lucide-react'
import '../App.css'

// Import images
import heroImage from '../assets/5cmRkapXTuoM.jpg'
import cleaningTeam from '../assets/2thA4HhNk0XT.jpeg'
import maintenanceTeam from '../assets/rduy6bSXxme6.jpeg'
import transportationVan from '../assets/rJJRyGuRUk22.jpg'
import officeCleaningImage from '../assets/WrsKUYKQL1P1.jpg'
import commercialCleaningImage from '../assets/lPjrkcLyeWJF.jpg'
import maintenanceServiceImage from '../assets/UsdpIwEeYfxP.png'

// Import colorful backgrounds
import colorfulHeroBg from '../assets/colorful-hero-bg.png'
import colorfulServicesBg from '../assets/colorful-services-bg.png'
import colorfulContactBg from '../assets/colorful-contact-bg.png'

function Home() {
  const [activeService, setActiveService] = useState('cleaning')
  const [isMuted, setIsMuted] = useState(false)
  const navigate = useNavigate()
  
  // Audio context for interactive sounds only
  const audioContextRef = useRef(null)

  // Initialize audio system
  useEffect(() => {
    // Initialize audio context on user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
    }

    // Add click listener to initialize audio on first user interaction
    document.addEventListener('click', initAudio, { once: true })
    document.addEventListener('touchstart', initAudio, { once: true })

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Generate click sound using Web Audio API
  const playClickSound = () => {
    if (!audioContextRef.current || isMuted) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    // Create a pleasant click sound
    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }

  // Generate hover sound using Web Audio API
  const playHoverSound = () => {
    if (!audioContextRef.current || isMuted) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    // Create a subtle hover sound
    oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime)
    oscillator.frequency.linearRampToValueAtTime(800, audioContextRef.current.currentTime + 0.05)
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.05)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.05)
  }

  // Toggle mute for interactive sounds
  const toggleMute = () => {
    if (!audioContextRef.current) {
      // Initialize audio context if not already done
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    setIsMuted(!isMuted)
  }

  // Enhanced button click handler
  const handleButtonClick = (callback) => {
    playClickSound()
    if (callback) callback()
  }

  // Enhanced service change handler
  const handleServiceChange = (service) => {
    playClickSound()
    setActiveService(service)
  }

  // Navigation functions
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Form submission handler
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message')
    }
    
    console.log('Form submitted:', data)
    alert('Thank you for your message! We will get back to you within 24 hours.')
    e.target.reset()
    playClickSound()
  }

  const services = {
    cleaning: [
      {
        title: "Home & Office Cleaning",
        description: "Regular, deep, move-in/out, and post-renovation cleaning",
        icon: "🏠"
      },
      {
        title: "Commercial & Institutional Cleaning",
        description: "Offices, schools, clinics, restaurants, and retail spaces",
        icon: "🏢"
      },
      {
        title: "Carpet, Floor & Window Care",
        description: "Carpet shampooing, tile polishing, window and floor cleaning",
        icon: "🪟"
      },
      {
        title: "Sanitization & Disinfection",
        description: "High-touch surfaces and full-space COVID-safe deep cleaning",
        icon: "🧽"
      }
    ],
    maintenance: [
      {
        title: "Janitorial & Basic Maintenance",
        description: "Trash removal, restocking, light repairs, and handyman services",
        icon: "🔧"
      },
      {
        title: "Specialty & Extra Services",
        description: "Gutter cleaning, laundry, eco-friendly options, and event cleanup",
        icon: "⚡"
      }
    ],
    transportation: [
      {
        title: "Reliable Transportation Services",
        description: "Professional transportation solutions for your business needs",
        icon: "🚐"
      },
      {
        title: "Logistics & Delivery",
        description: "Efficient logistics and delivery services for commercial clients",
        icon: "📦"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="colorful-nav shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center slide-in-left">
              <div className="text-2xl font-bold rainbow-text">Aplus+</div>
              <div className="ml-2 text-sm text-gray-600">Cleaning/Maintenance Services</div>
            </div>
            <nav className="hidden md:flex space-x-8 nav-desktop">
              <button onClick={() => { playClickSound(); scrollToSection('home'); }} className="text-gray-700 hover:text-blue-600 transition-colors nav-link-colorful">Home</button>
              <button onClick={() => { playClickSound(); scrollToSection('services'); }} className="text-gray-700 hover:text-blue-600 transition-colors nav-link-colorful">Services</button>
              <button onClick={() => { playClickSound(); scrollToSection('about'); }} className="text-gray-700 hover:text-blue-600 transition-colors nav-link-colorful">About</button>
              <button onClick={() => { playClickSound(); scrollToSection('contact'); }} className="text-gray-700 hover:text-blue-600 transition-colors nav-link-colorful">Contact</button>
            </nav>
            <div className="flex items-center space-x-4 slide-in-right">
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                07424185232
              </div>
              {/* Audio Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isMuted ? "Enable Sounds" : "Mute Sounds"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <Button 
                className="rainbow-button"
                onClick={() => { handleButtonClick(); navigate('/booking'); }}
                onMouseEnter={playHoverSound}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative colorful-hero-bg text-white">
        <div className="floating-shapes"></div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 rainbow-text glow-text">
              Aplus+ — Your One-Stop Solution
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white slide-in-left">
              for Reliable Cleaning, Maintenance, and Transportation Services
            </p>
            <p className="text-lg md:text-xl mb-8 text-blue-100 slide-in-right">
              We Handle the Details, So You Don't Have To
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <Button 
                size="lg" 
                className="rainbow-button"
                onClick={() => { handleButtonClick(); navigate('/booking'); }}
                onMouseEnter={playHoverSound}
              >
                Get Free Quote
              </Button>
              <Button 
                size="lg" 
                className="rainbow-button"
                onClick={() => { handleButtonClick(); scrollToSection('about'); }}
                onMouseEnter={playHoverSound}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 colorful-services-bg">
        <div className="floating-shapes"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 glow-text">Our Services</h2>
            <p className="text-lg text-white max-w-2xl mx-auto glow-text">
              Professional cleaning, maintenance, and transportation services tailored to your needs
            </p>
          </div>

          {/* Service Categories */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => handleServiceChange('cleaning')}
                onMouseEnter={playHoverSound}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeService === 'cleaning' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Cleaning
              </button>
              <button
                onClick={() => handleServiceChange('maintenance')}
                onMouseEnter={playHoverSound}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeService === 'maintenance' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Maintenance
              </button>
              <button
                onClick={() => handleServiceChange('transportation')}
                onMouseEnter={playHoverSound}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeService === 'transportation' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Transportation
              </button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services[activeService].map((service, index) => (
              <Card key={index} className="colorful-service-card hover-lift">
                <CardHeader>
                  <div className="text-3xl mb-2 animated-icon">{service.icon}</div>
                  <CardTitle className="text-lg text-gray-900 font-bold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 font-medium">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Images */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center fade-in">
              <div className="service-image rounded-lg overflow-hidden mb-4">
                <img 
                  src={cleaningTeam} 
                  alt="Professional Cleaning Team" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-white glow-text">Professional Cleaning</h3>
              <p className="text-blue-100 font-medium">Expert cleaning services for all your needs</p>
            </div>
            <div className="text-center fade-in">
              <div className="service-image rounded-lg overflow-hidden mb-4">
                <img 
                  src={maintenanceTeam} 
                  alt="Maintenance Team" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-white glow-text">Maintenance Services</h3>
              <p className="text-blue-100 font-medium">Reliable maintenance and repair solutions</p>
            </div>
            <div className="text-center fade-in">
              <div className="service-image rounded-lg overflow-hidden mb-4">
                <img 
                  src={transportationVan} 
                  alt="Transportation Services" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-white glow-text">Transportation</h3>
              <p className="text-blue-100 font-medium">Professional transportation and logistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="slide-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Aplus+ Services
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Led by CEO Mathieu Thobie Njiemoun, Aplus+ Cleaning/Maintenance Services Limited 
                is your trusted partner for comprehensive cleaning, maintenance, and transportation solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We pride ourselves on delivering excellence in every service, ensuring your spaces 
                are clean, well-maintained, and your transportation needs are met with professionalism.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start fade-in">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 feature-icon" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Professional Team</h3>
                    <p className="text-gray-600">Experienced and trained professionals</p>
                  </div>
                </div>
                <div className="flex items-start fade-in">
                  <Star className="h-6 w-6 text-yellow-500 mr-3 mt-1 feature-icon" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality Service</h3>
                    <p className="text-gray-600">Committed to excellence in every job</p>
                  </div>
                </div>
                <div className="flex items-start fade-in">
                  <Clock className="h-6 w-6 text-blue-500 mr-3 mt-1 feature-icon" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reliable</h3>
                    <p className="text-gray-600">On-time service you can count on</p>
                  </div>
                </div>
                <div className="flex items-start fade-in">
                  <Award className="h-6 w-6 text-purple-500 mr-3 mt-1 feature-icon" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trusted</h3>
                    <p className="text-gray-600">Building long-term relationships</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="slide-in-right">
              <div className="service-image rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={officeCleaningImage} 
                  alt="Professional Office Cleaning" 
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 colorful-contact-bg">
        <div className="floating-shapes"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 rainbow-text">Contact Us</h2>
            <p className="text-lg text-white glow-text">
              Ready to experience the Aplus+ difference? Get in touch with us today.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="slide-in-left">
              <div className="colorful-form p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-yellow-300 mb-6 glow-text">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-yellow-400 mr-4 mt-1 animated-icon" />
                    <div>
                      <h4 className="font-semibold text-black">Address</h4>
                      <p className="text-black font-medium">
                        8 Lytham Close<br />
                        Derby, DE21 4EB<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-6 w-6 text-green-400 mr-4 mt-1 animated-icon" />
                    <div>
                      <h4 className="font-semibold text-black">Phone</h4>
                      <p className="text-black font-medium">07424185232</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-pink-400 mr-4 mt-1 animated-icon" />
                    <div>
                      <h4 className="font-semibold text-black">Email</h4>
                      <p className="text-black font-medium">apluscleaningservices0@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-6 w-6 text-purple-400 mr-4 mt-1 animated-icon" />
                    <div>
                      <h4 className="font-semibold text-black">CEO</h4>
                      <p className="text-black font-medium">Mathieu Thobie Njiemoun</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="slide-in-right">
              <Card className="colorful-form rainbow-border hover-lift">
                <CardHeader>
                  <CardTitle className="rainbow-text">Request a Quote</CardTitle>
                  <CardDescription className="text-gray-700">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleFormSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          name="firstName"
                          className="colorful-input w-full px-3 py-2 rounded-md focus:outline-none transition-all"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          name="lastName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="07424185232"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Needed
                      </label>
                      <select name="service" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" required>
                        <option value="">Select a service</option>
                        <option value="cleaning">Cleaning Services</option>
                        <option value="maintenance">Maintenance Services</option>
                        <option value="transportation">Transportation Services</option>
                        <option value="multiple">Multiple Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea 
                        rows={4}
                        name="message"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Tell us about your needs..."
                        required
                      ></textarea>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full rainbow-button"
                      onMouseEnter={playHoverSound}
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">Aplus+</div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for professional cleaning, maintenance, and transportation services.
              </p>
              <div className="text-sm text-gray-400">
                <p>CEO: Mathieu Thobie Njiemoun</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Home & Office Cleaning</li>
                <li>Commercial Cleaning</li>
                <li>Maintenance Services</li>
                <li>Transportation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>8 Lytham Close, Derby, DE21 4EB</p>
                <p>07424185232</p>
                <p>apluscleaningservices0@gmail.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-400">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 4:00 PM</p>
                <p>Sunday: Emergency Services Only</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Aplus+ Cleaning/Maintenance Services Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

