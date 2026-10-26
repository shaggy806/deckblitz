import { defineCard } from "../define.js";

// EDHREC rank 23693. Coveted Peacock's "you may … target creature defending player controls".

export default defineCard({
  name: "Skymark Roc",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, you may return target creature defending player controls with toughness 2 or less to its owner's hand.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "defending-player",
          filter: { type: "creature", toughness: { op: "lte", n: 2 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return that creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may return target creature defending player controls with toughness 2 or less to its owner's hand.",
    },
  ],
});
