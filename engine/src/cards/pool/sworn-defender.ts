import { defineCard } from "../define.js";

// Each read once, as the effect applies (rule 608.2h).
const TEXT =
  "{1}: This creature's power becomes the toughness of target creature blocking or being blocked by this creature minus 1 until end of turn, and its toughness becomes 1 plus the power of that creature until end of turn.";

export default defineCard({
  name: "Sworn Defender",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "either" } } }],
      effect: {
        kind: "animate",
        target: "source",
        power: { difference: [{ toughnessOf: 0 }, 1] },
        toughness: { sum: [{ powerOf: 0 }, 1] },
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
