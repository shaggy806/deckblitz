import { defineCard } from "../define.js";

// EDHREC rank 22932.

export default defineCard({
  name: "Stonebrow, Krosan Hero",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nWhenever a creature you control with trample attacks, it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", keyword: "trample" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature you control with trample attacks, it gets +2/+2 until end of turn.",
    },
  ],
});
