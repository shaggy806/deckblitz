import { defineCard } from "../define.js";

// EDHREC rank 30881. Every creature that died this turn, whoever controlled
// it — counted at the end step, so the Ghoul claims them even if it entered
// after they died (the ruling).

const END_TEXT =
  "At the beginning of each end step, put a corpse counter on this creature for each creature that died this turn.";
const REGEN_TEXT = "Remove a corpse counter from this creature: Regenerate this creature.";

export default defineCard({
  name: "Scavenging Ghoul",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: `${END_TEXT}\n${REGEN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "corpse", count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "corpse",
        amount: { creaturesDiedThisTurn: true, anyController: true },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
