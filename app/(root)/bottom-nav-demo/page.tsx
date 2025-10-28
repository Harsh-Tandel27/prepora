import BottomNavBar from '@/components/ui/top-nav-bar'

export default function BottomNavDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">BottomNavBar Component Demo</h1>
          <p className="text-muted-foreground">
            A beautiful animated bottom navigation bar with smooth transitions
          </p>
        </div>

        <div className="space-y-8">
          {/* Default BottomNavBar */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Default BottomNavBar</h2>
            <div className="flex justify-center">
              <BottomNavBar />
            </div>
          </div>

          {/* Sticky Bottom NavBar */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Sticky Bottom NavBar</h2>
            <p className="text-muted-foreground">
              This one is fixed to the bottom of the screen
            </p>
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Scroll down to see the sticky nav bar</p>
            </div>
          </div>

          {/* Custom Styled BottomNavBar */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Custom Styled BottomNavBar</h2>
            <div className="flex justify-center">
              <BottomNavBar 
                className="bg-gradient-to-r from-purple-500 to-pink-500 border-purple-300"
                defaultIndex={2}
              />
            </div>
          </div>

          {/* Content to demonstrate scrolling */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Scrollable Content</h2>
            <div className="space-y-4">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="p-6 bg-card rounded-lg border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Content Section {i + 1}
                  </h3>
                  <p className="text-muted-foreground">
                    This is some sample content to demonstrate scrolling behavior with the sticky bottom navigation bar.
                    The navigation bar will remain fixed at the bottom of the screen as you scroll.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky BottomNavBar - This will be fixed to bottom */}
      <BottomNavBar stickyTop />
    </div>
  )
}

