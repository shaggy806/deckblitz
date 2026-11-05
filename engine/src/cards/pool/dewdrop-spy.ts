import { defineCard } from "../define.js";

// EDHREC rank 24229.

export default defineCard({
  name: "Dewdrop Spy",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, look at the top card of target player's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "look-at-library-top", target: 0 },
      resolve: null,
      text: "When this creature enters, look at the top card of target player's library.",
    },
  ],
});
