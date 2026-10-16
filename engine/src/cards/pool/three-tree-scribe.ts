import { defineCard } from "../define.js";

// EDHREC rank 8632. Bloomburrow.
//
// Imperial Cosmographer's "leaves the battlefield without dying" — any zone
// but the graveyard — without `otherOnly`, so this creature leaving counts
// too, and it triggers once per creature when several leave at once (the
// rulings). Read as they last existed, so it sees itself leave.
const TEXT =
  "Whenever this creature or another creature you control leaves the battlefield without dying, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Three Tree Scribe",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Druid"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        to: ["exile", "hand", "library", "command"],
      },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
