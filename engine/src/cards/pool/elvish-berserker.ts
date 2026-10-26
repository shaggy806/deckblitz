import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 23909.
//
// The blockers are counted as the trigger resolves (Jungle Wurm's shape).

const TEXT = "Whenever this creature becomes blocked, it gets +1/+1 until end of turn for each creature blocking it.";

export default defineCard({
  name: "Elvish Berserker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 1,
  toughness: 1,
  text: TEXT,
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
      text: TEXT,
    },
  ],
});
