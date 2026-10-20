import { defineCard } from "../define.js";

// EDHREC rank 22770.
// Makes Human → use "Human Token".

export default defineCard({
  name: "Dawnhart Mentor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 0,
  toughness: 4,
  text: "When this creature enters, create a 1/1 white Human creature token.\nCoven — {5}{G}: Target creature you control gets +3/+3 and gains trample until end of turn. Activate only if you control three or more creatures with different powers.",
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Coven — {5}{G}: Target creature you control gets +3/+3 and gains trample until end of turn. Activate only if you control three or more creatures with different powers.",
      condition: { kind: "coven" },
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Human creature token.",
    },
  ],
});
