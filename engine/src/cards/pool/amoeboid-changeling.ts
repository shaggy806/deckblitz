import { defineCard } from "../define.js";

const GAIN = "{T}: Target creature gains all creature types until end of turn.";
const LOSE = "{T}: Target creature loses all creature types until end of turn.";

export default defineCard({
  name: "Amoeboid Changeling",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  power: 1,
  toughness: 1,
  text: `Changeling (This card is every creature type.)\n${GAIN}\n${LOSE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature" } }],
      effect: { kind: "become", target: 0, addSubtypes: ["(every creature type)"], duration: "end-of-turn" },
      resolve: null,
      text: GAIN,
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature" } }],
      effect: { kind: "become", target: 0, loseCreatureTypes: true, duration: "end-of-turn" },
      resolve: null,
      text: LOSE,
    },
  ],
});
