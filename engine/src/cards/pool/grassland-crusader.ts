import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31818.

const TEXT = "{T}: Target Elf or Soldier creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Grassland Crusader",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtypes: ["Elf", "Soldier"] } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
