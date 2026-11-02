import { defineCard } from "../define.js";

const TEXT =
  "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, put a +1/+1 counter on this creature.";

// Adventures in the Forgotten Realms.
export default defineCard({
  name: "Gnoll Hunter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Gnoll"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
