import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			fitted: {
  				navy: {
  					DEFAULT: '#223a53',
  					dark: '#1a2e42'
  				},
  				blue: {
  					DEFAULT: '#567e9c',
  					mid: '#567e9c',
  					light: '#7fa3c4',
  					accent: '#3b82f6',
  					hover: '#93c5fd',
  					sky: '#bae3fd',
  					pale: 'rgba(186, 227, 253, 0.2)'
  				},
  				gray: {
  					'50': '#f9fafb',
  					'100': '#f3f4f6',
  					'200': '#e5e7eb',
  					'300': '#d1d5db',
  					'400': '#9ca3af',
  					'500': '#6b7280',
  					'600': '#4b5563',
  					'700': '#374151',
  					'800': '#1f2937',
  					'900': '#111827'
  				}
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			playfair: [
  				'Playfair Display',
  				'serif'
  			],
  			inter: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'fitted-title': 'clamp(4rem, 10vw, 7rem)',
  			'fitted-title-mobile': 'clamp(3rem, 15vw, 5rem)',
  			'fitted-loader': 'clamp(5rem, 12vw, 9rem)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'spin': {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'pulse': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-5px)'
  				}
  			},
  			'breathe': {
  				'0%, 100%': {
  					transform: 'scale(1)',
  					opacity: '0.8'
  				},
  				'50%': {
  					transform: 'scale(1.05)',
  					opacity: '1'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					left: '-100%'
  				},
  				'100%': {
  					left: '200%'
  				}
  			},
  			'fadeIn': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'slideUp': {
  				from: {
  					transform: 'translateY(1rem)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'spin': 'spin 0.8s linear infinite',
  			'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'breathe': 'breathe 2s ease-in-out infinite',
  			'shimmer': 'shimmer 3s infinite',
  			'fadeIn': 'fadeIn 0.2s ease-out',
  			'slideUp': 'slideUp 0.3s ease-out'
  		},
  		backgroundImage: {
  			'fitted-gradient': 'linear-gradient(135deg, #223a53 0%, #567e9c 50%, #7fa3c4 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
  			'fitted-logo-gradient': 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
  			'fitted-blue-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config