import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31606.
const TEXT = "{2}: Target white or black creature gains flying until end of turn.";

export default defineCard({
  name: "Sky Weaver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Metathran", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (It can't be blocked except by creatures with flying or reach.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["B"] }] } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
