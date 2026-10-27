import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31999.

const TEXT = "{2}: Target blue or red creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Hate Weaver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["U"] }, { colors: ["R"] }] } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
