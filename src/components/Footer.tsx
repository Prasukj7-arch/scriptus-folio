import { Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-1">
            <span>© 2025</span>
            <span className="font-medium">Prasuk Jain</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>

          {/* Center - Made with love */}
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>for book lovers</span>
          </div>

          {/* Right side - Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Prasukj7-arch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors duration-200"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/prasuk-jain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors duration-200"
            >
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
