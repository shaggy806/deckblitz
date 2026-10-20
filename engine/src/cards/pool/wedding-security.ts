import { defineCard } from "../define.js";

// EDHREC rank 16495. High-Society Hunter's "you may sacrifice …. If you do"
// shape. A Blood token is any artifact token with the subtype Blood (the
// ruling).
const TEXT =
  "Whenever this creature attacks, you may sacrifice a Blood token. If you do, put a +1/+1 counter on this creature and draw a card.";

export default defineCard({
  name: "Wedding Security",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact", subtype: "Blood", token: true }, text: "Sacrifice a Blood token" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "draw", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
