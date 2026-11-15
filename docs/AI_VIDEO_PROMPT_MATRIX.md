# Skillverse — AI Video Generation Prompt Matrix

Production-grade, calibrated prompt engineering matrix for generating the seamless 10-second continuous cinematic flythrough across next-generation video foundation models: **Google Veo 2**, **OpenAI Sora**, **Kling 1.5**, and **Runway Gen-3 Alpha**.

---

## 1. Master Master-Prompt (Single-Shot 10-Second Continuous Take)

> **Positive Master Prompt**:
> `Seamless 10-second continuous cinematic 3D drone-to-street flythrough of "Skillverse", a vast living miniature Earth where human skills are embodied by 25–35 cm humanoid robots with matte ceramic armor, brushed titanium limbs, and expressive LED eyes. Begins with a slow, breathtaking aerial descent from 1,200 meters piercing fluffy volumetric stratocumulus clouds during golden hour, sunbeams filtering through mist and illuminating the planet's curved horizon. Camera swoops forward into Tech City, gliding smoothly between futuristic glass skyscrapers with reflective windows and holographic advertisements, soaring inches above an elevated magnetic levitation train gliding across a suspension bridge. The camera gracefully levels off to street level, tracking at 45 cm ground elevation along wet asphalt pavement with real-time neon reflections in puddles. A young explorer avatar in a practical futuristic slate-blue jacket walks forward looking at a glowing holographic tablet, accompanied in lockstep cadence by small 28 cm humanoid skill robots with glowing cyan circuit veins, expressive LED eyes, and miniature tool backpacks. The camera performs a smooth ascending crane tilt lifting high above city rooftops into a wide panoramic master shot revealing the interconnected living world: an industrial engineering harbor with cranes, mist-covered adventure mountains, turquoise ocean coastline, and a space launch base with heavy rockets venting cryogenic steam under the evening twilight sky. Single continuous take, zero cuts, zero text, zero watermarks, stable physics, photorealistic Unreal Engine 5 render, ray-traced lighting, 8k ultra-detailed.`

> **Universal Negative Prompt**:
> `cartoon, 2D, flat illustration, anime, CGI low poly, low resolution, blurry textures, noisy artifacts, cheap plastic gloss, distorted anatomy, morphing geometry, extra limbs, extra fingers, deformed faces, duplicated characters, floating disconnected objects, broken physics, jittery camera, jump cuts, scene cuts, sudden zooms, lifeless empty streets, horror robots, scary metallic skulls, oversaturated garish colors, washed-out contrast, text, subtitle, watermark, logo, signature, frame drop, flicker.`

---

## 2. Model-Specific Implementations

### A. Google Veo 2 Configuration
- **Model Target**: `veo-2.0-generate-001`
- **Duration**: `10 seconds` | **Aspect Ratio**: `16:9` or `2.39:1` | **Resolution**: `4K / 8K`
- **Camera Motion Controls**:
  ```json
  {
    "camera_motion": {
      "trajectory": "continuous_spline_descent_to_crane",
      "speed": "cinematic_smooth",
      "pacing": [
        {"t_seconds": [0.0, 2.5], "motion": "downward_spiral_descent", "target": "planet_horizon"},
        {"t_seconds": [2.5, 5.5], "motion": "forward_canyon_glide", "target": "maglev_train"},
        {"t_seconds": [5.5, 8.0], "motion": "low_angle_ground_tracking", "target": "mini_robots_and_explorer"},
        {"t_seconds": [8.0, 10.0], "motion": "crane_tilt_and_pullout", "target": "space_base_and_ocean"}
      ]
    }
  }
  ```

### B. OpenAI Sora Configuration
- **Prompt**:
  `A seamless 10-second continuous camera flight through a miniature planet Earth called Skillverse. The camera starts high above clouds looking down at the curved planet at sunset, drops smoothly through dense volumetric clouds into a dense futuristic city of glass towers and smart roads, skims past a moving maglev train, descends directly to wet pavement level where a human explorer in a technical jacket walks with 28cm tall friendly humanoid robots with glowing cyan LED eyes and circuit veins, and finally lifts up in a grand crane shot to reveal mountains, ocean, and a space launch pad in the distance. No cuts, stable physical motion, photorealistic lighting, cinematic anamorphic lenses.`

### C. Kling 1.5 Professional Camera Tokens
- **Camera Movement**: `Down + Forward -> Level Track -> Up + Pan Right`
- **Horizontal**: `+0.4` | **Vertical**: `-0.8 -> +0.9` | **Zoom**: `+0.5` | **Roll**: `0.0`
- **Config**: Mode `High Quality`, Prompt Adherence `0.75`, Creativity `0.35` (to eliminate character morphing).

### D. Runway Gen-3 Alpha Camera Work
- **Camera Motion Parameter String**:
  `[Pan: Right 0.2] [Tilt: Down 0.6 -> Up 0.8] [Zoom: In 0.5 -> Out 0.4] [Motion: 4]`
  - Frame 0s–2.5s: `[F: Down 0.8, In 0.6]`
  - Frame 2.5s–5.5s: `[F: In 0.7, Right 0.1]`
  - Frame 5.5s–8.0s: `[F: Steady Track, Speed 2]`
  - Frame 8.0s–10.0s: `[F: Up 0.9, Out 0.6]`

---

## 3. Frame-by-Frame Storyboard Keyframe Matrix

| Time | Keyframe Focal Subject | Atmosphere & Lighting | Character Action & Scale |
| :--- | :--- | :--- | :--- |
| **0.0s** | Miniature Earth horizon curve from 1,200m | Low-angle sun (14°) creating golden rim lighting on stratocumulus clouds | Distant planetary lights visible through cloud gaps |
| **2.0s** | Cloud parting over Tech City | Warm light shafts (God rays) illuminating glass skyscrapers | Maglev monorail approaching suspension bridge |
| **4.0s** | Skimming between twin arcology towers at 35m | Neon cyan and amber reflections bouncing off wet curtain walls | Flying personal drones weaving in designated air corridors |
| **6.0s** | Wet asphalt street pavement at 45cm elevation | Puddles with crisp screen-space reflections of streetlights | Explorer avatar walking; Coding Robot typing on floating translucent keyboard |
| **7.5s** | Explorer avatar (175cm) looking down at tablet | Golden sunset rim light highlighting tactile fabric of explorer's jacket | 28cm Coding Robot and 30cm AI Robot with glowing violet dome walking alongside |
| **9.0s** | Ascending crane shot lifting over rooftops | Twilight gradient: deep indigo sky with amber horizon glow | Engineering harbor cranes moving containers into position |
| **10.0s**| Panoramic wide master reveal at 180m | Distant mountains with waterfall mist; Space Launch Base with rockets poised | Rocket engines venting white cryogenic steam; total world harmony |
