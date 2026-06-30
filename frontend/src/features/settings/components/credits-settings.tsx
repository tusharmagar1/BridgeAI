import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BridgeLogo } from '@/components/ui/bridge-logo'
import { Linkedin, Github, Heart, Award } from 'lucide-react'

export function CreditsSettings() {
  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      {/* Header Profile */}
      <div className="text-center py-6 space-y-3">
        <div className="relative inline-block">
          <BridgeLogo className="w-[88px] h-[88px] mx-auto" animated />
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-md animate-bounce">
            <Heart className="w-3.5 h-3.5 fill-current text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">BridgeAI</h2>
          <p className="text-xs font-semibold text-bridge-500 italic mt-1">
            "Bridging Human Intelligence with Artificial Intelligence."
          </p>
        </div>
      </div>

      {/* Description Card */}
      <Card className="border border-[var(--color-border-default)] shadow-sm bg-[var(--color-surface-secondary)]/10">
        <CardContent className="p-5 md:p-6 text-center">
          <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            BridgeAI is a modern AI assistant built for conversations, coding, research, multilingual communication, and productivity. It combines powerful language models with an elegant user experience to help users learn, create, and solve problems efficiently.
          </p>
        </CardContent>
      </Card>

      {/* Creator Card */}
      <Card className="border border-[var(--color-border-default)] shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 text-center">
          <CardTitle className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-bridge-500" /> Created with ❤️ by
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <h3 className="text-xl font-black text-[var(--color-text-primary)]">Tushar Magar</h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-1">
              AI Engineer • Python Developer • Machine Learning Enthusiast
            </p>
          </div>
          
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.linkedin.com/in/tushar-magar-7b80a2255/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] hover:bg-[var(--color-hover-bg)] hover:border-bridge-500 hover:text-bridge-500 text-xs font-bold text-[var(--color-text-secondary)] transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
              <span>Connect on LinkedIn</span>
            </a>
            <a
              href="https://github.com/tusharmagar1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-primary)] hover:bg-[var(--color-hover-bg)] hover:border-bridge-500 hover:text-bridge-500 text-xs font-bold text-[var(--color-text-secondary)] transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Profile</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Thank You Quote */}
      <div className="relative p-5 md:p-6 rounded-2xl border-l-4 border-bridge-500 bg-bridge-500/5 text-center">
        <p className="text-xs md:text-sm italic text-[var(--color-text-secondary)] leading-relaxed">
          "Thank you for using BridgeAI. Every feature has been designed with the goal of making AI more accessible, practical, and enjoyable for everyone."
        </p>
      </div>

      {/* Version and Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-[var(--color-border-default)] shadow-sm">
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Application</p>
            <p className="text-base font-black text-[var(--color-text-primary)]">BridgeAI</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Version 1.0</p>
          </CardContent>
        </Card>
        <Card className="border border-[var(--color-border-default)] shadow-sm">
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</p>
            <p className="text-base font-black text-emerald-500">Production</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Active & Secure</p>
          </CardContent>
        </Card>
      </div>

      {/* Copyright Notice */}
      <div className="text-center pt-4 text-[10px] text-[var(--color-text-tertiary)] font-semibold space-y-1">
        <p>© 2026 BridgeAI. Created and Developed by Tushar Magar.</p>
        <p>All Rights Reserved.</p>
      </div>
    </div>
  )
}
