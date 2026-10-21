import { defineCard } from "../define.js";

// EDHREC rank 29573.

const TEXT =
  "At the beginning of combat on your turn, if you control a Basri planeswalker, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Adherent of Hope",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Basri" }, atLeast: 1 },
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
