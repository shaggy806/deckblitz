import { defineCard } from "../define.js";

// EDHREC rank 21237.

const ENTER_TEXT =
  "Whenever another Mutant you control enters, put a +1/+1 counter on that creature and a +1/+1 counter on X-23.";

export default defineCard({
  name: "X-23, Deadly Weapon",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Berserker", "Hero"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Mutant" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
