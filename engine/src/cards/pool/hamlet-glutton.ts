import { defineCard } from "../define.js";

// EDHREC rank 23803.

export default defineCard({
  name: "Hamlet Glutton",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  kicker: { cost: "", keyword: "bargain", reduceGeneric: 2 },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nThis spell costs {2} less to cast if it's bargained.\nTrample\nWhen this creature enters, you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When this creature enters, you gain 3 life.",
    },
  ],
});
