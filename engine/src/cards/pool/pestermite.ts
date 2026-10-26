import { defineCard } from "../define.js";

export default defineCard({
  name: "Pestermite",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, you may tap or untap target permanent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target permanent.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target permanent.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, you may tap or untap target permanent.",
    },
  ],
});
