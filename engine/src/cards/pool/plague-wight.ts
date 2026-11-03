import { defineCard } from "../define.js";

// Ravnica Allegiance (RNA). EDHREC rank 28437.
const TEXT = "Whenever this creature becomes blocked, each creature blocking it gets -1/-1 until end of turn.";

export default defineCard({
  name: "Plague Wight",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
