// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-pink-50">
      <div className="text-center space-y-6">
        {/* Logo animé */}
        <div className="relative">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent animate-pulse">
            Bella Fleurs
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-pink-600 rounded-lg blur opacity-25 animate-pulse"></div>
        </div>
        
        {/* Spinner floral avec CSS pur */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 relative">
            {/* Pétales qui tournent */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full opacity-70 animate-spin"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-20px)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
            
            {/* Centre */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-gray-600 text-lg animate-fade-in">
          Préparation de vos plus belles fleurs...
        </p>
        
        {/* Points animés */}
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Pétales flottants en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-pink-300 to-primary-300 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}