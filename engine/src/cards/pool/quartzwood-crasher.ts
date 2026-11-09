import { defineCard } from "../define.js";

// EDHREC rank 2015.
//
// Rulings: it counts its own damage while it has trample; the batch's value is
// the total the matching creatures dealt that player.
const TEXT =
  "Whenever one or more creatures you control with trample deal combat damage to a player, create an X/X green Dinosaur Beast creature token with trample, where X is the amount of damage those creatures dealt to that player.";

export default defineCard({
  name: "Quartzwood Crasher",
  manaCost: "{2}{R}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature", keyword: "trample" }, combat: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Dinosaur Beast Token",
        count: 1,
        basePt: { power: { triggerValue: true }, toughness: { triggerValue: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
