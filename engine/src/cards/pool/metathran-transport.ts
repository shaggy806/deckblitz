import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30371.
export default defineCard({
  name: "Metathran Transport",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nThis creature can't be blocked by blue creatures.\n{U}: Target creature becomes blue until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["U"] },
      text: "This creature can't be blocked by blue creatures.",
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" },
      resolve: null,
      text: "{U}: Target creature becomes blue until end of turn.",
    },
  ],
});
