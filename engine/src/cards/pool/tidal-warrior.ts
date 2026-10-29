import { defineCard } from "../define.js";

// Rule 305.7: the land loses its other land types and its rules-text
// abilities until end of turn, and taps for {U}.
export default defineCard({
  name: "Tidal Warrior",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Warrior"],
  power: 1,
  toughness: 1,
  text: "{T}: Target land becomes an Island until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, setSubtypes: ["Island"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target land becomes an Island until end of turn.",
    },
  ],
});
