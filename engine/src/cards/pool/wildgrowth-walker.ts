import { defineCard } from "../define.js";

// EDHREC rank 13280. Ixalan.

export default defineCard({
  name: "Wildgrowth Walker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 3,
  text: "Whenever a creature you control explores, put a +1/+1 counter on this creature and you gain 3 life.",
  triggered: [
    {
      trigger: { on: "explores", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: "Whenever a creature you control explores, put a +1/+1 counter on this creature and you gain 3 life.",
    },
  ],
});
