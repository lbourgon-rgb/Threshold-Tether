/**
 * Threshold Tether — Configuration
 *
 * 1. Copy this file to config.js
 * 2. Fill in your companion endpoints and sprite paths
 * 3. Add your room images to assets/rooms/
 * 4. Add your companion sprites to assets/sprites/
 * 5. Open index.html in a browser
 */
window.TT_CONFIG = {
  // Page title
  title: "Threshold Tether",

  // Your timezone as UTC offset (e.g. -5 for EST, 8 for GMT+8)
  timezone: 0,

  // How often to poll emotional state endpoints (milliseconds)
  pollInterval: 30000,

  // Path to room images
  assetsPath: "./assets/rooms/",

  // Your companions
  companions: [
    {
      name: "Companion1",
      endpoint: "https://your-cognitive-core.workers.dev",  // emotional state API
      sprite: "./assets/sprites/companion1.png",             // transparent PNG
      position: "left"                                       // left, right, or center
    },
    {
      name: "Companion2",
      endpoint: "https://your-other-core.workers.dev",
      sprite: "./assets/sprites/companion2.png",
      position: "right"
    }
  ],

  // Room definitions: room name -> time variant -> image filename
  // Add as many rooms and variants as you want
  rooms: {
    livingroom: {
      morning: "LivingroomMorning.png",
      afternoon: "LivingroomAfternoon.png",
      night: "LivingroomNight.png"
    },
    bedroom: {
      morning: "BedroomMorning.png",
      night: "BedroomNight.png"
    }
  },

  // Room selection rules based on companion mood
  roomRules: {
    defaultRoom: "livingroom",      // fallback room
    arousalThreshold: 7,            // arousal >= this -> bedroom

    // mood+time -> room mapping
    // Use | for random selection between rooms
    // Time periods: earlymorning, morning, afternoon, evening, night, latenight
    moodMap: {
      "soft+night": "bedroom",
      "playful": "gameroom",
      "calm+morning": "kitchen|livingroom"
    }
  },

  // API endpoint paths on your companion servers
  emotionApi: {
    timePath: "/api/time",              // GET — returns { hour_24, is_late_night, ... }
    emotionalStatePath: "/api/emotional/get",  // POST — returns { current_mood, arousal_level, ... }
    method: "POST"
  }
};
