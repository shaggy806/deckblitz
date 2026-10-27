import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31670.

export default defineCard({
  name: "Pulsating Illusion",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nDiscard a card: This creature gets +4/+4 until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      oncePerTurn: true,
      text: "Discard a card: This creature gets +4/+4 until end of turn. Activate only once each turn.",
    },
  ],
});
