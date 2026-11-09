import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more creatures you control with flying deal combat damage to a player, put a +1/+1 counter on each of those creatures and draw a card.";

export default defineCard({
  name: "Vulture, Feathered Fiend",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature", keyword: "flying" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { inSet: "trigger-batch" }, counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
