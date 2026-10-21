import { defineCard } from "../define.js";

// Ruling: you either take the damage or pay the {2} as the trigger resolves.

export default defineCard({
  name: "Hasran Ogress",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 3,
  toughness: 2,
  text: "Whenever this creature attacks, it deals 3 damage to you unless you pay {2}.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "damage", amount: 3, who: "you" },
      },
      resolve: null,
      text: "Whenever this creature attacks, it deals 3 damage to you unless you pay {2}.",
    },
  ],
});
