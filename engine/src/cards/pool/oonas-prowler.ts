import { defineCard } from "../define.js";

// "Any player may activate this ability" (`anyPlayer`): whoever activates it
// discards one of their own cards (rule 602.2a).

const TEXT = "Discard a card: This creature gets -2/-0 until end of turn. Any player may activate this ability.";

export default defineCard({
  name: "Oona's Prowler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
