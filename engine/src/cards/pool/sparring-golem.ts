import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30904. Elvish Berserker's trigger.

const BLOCKED =
  "Whenever this creature becomes blocked, it gets +1/+1 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Sparring Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  text: BLOCKED,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { blockersOf: "source" },
        toughness: { blockersOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: BLOCKED,
    },
  ],
});
