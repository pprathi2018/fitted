import Link from 'next/link'
import { Upload, Palette, Shirt } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-fitted-blue flex items-center justify-center">
      <div className="text-center">
        <h1 className="fitted-title">Fitted</h1>
        
        <div className="flex flex-col items-center">
          <Link href="/upload" className="fitted-oval-btn">
            <Upload size={32} />
            <span>Upload Clothes</span>
          </Link>
          
          <Link href="/closet" className="fitted-oval-btn">
            <Shirt size={32} />
            <span>View Closet</span>
          </Link>
          
          <Link href="/outfit" className="fitted-oval-btn">
            <Palette size={32} />
            <span>Build Outfit</span>
          </Link>
        </div>
      </div>
    </main>
  )
}