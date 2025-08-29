import { cva } from 'class-variance-authority';

export const authPageLayout = "min-h-screen bg-fitted-gradient flex items-center justify-center p-4";
export const pageContainer = "w-full max-w-md space-y-8";

export const fittedButton = cva(
  "min-w-[210px] h-auto py-4 bg-white/80 hover:bg-white/95 text-blue-700 border border-fitted-blue-accent/20 backdrop-blur-[10px] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary: "bg-fitted-blue-accent hover:bg-blue-700 text-white border-0",
        secondary: "bg-white hover:bg-fitted-gray-50 text-fitted-blue-accent border-fitted-blue-accent",
        ghost: "bg-transparent hover:bg-fitted-blue-accent/10 shadow-none border-0",
        danger: "bg-red-500 hover:bg-red-600 text-white border-0"
      },
      size: {
        sm: "min-w-0 px-4 py-2 text-sm",
        md: "min-w-[150px] py-3",
        lg: "min-w-[210px] py-4",
        full: "w-full py-3"
      }
    },
    defaultVariants: {
      size: "lg"
    }
  }
);

export const glassCard = "glass-card rounded-2xl p-8 shadow-xl";
export const solidCard = "bg-white rounded-2xl p-8 shadow-lg";