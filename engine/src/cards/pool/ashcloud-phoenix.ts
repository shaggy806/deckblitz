import { defineCard } from "../define.js";

// EDHREC rank 12090. Back face down by an effect (rule 708.2a's 2/2), turned up
// only for its morph cost. A face-down Phoenix has no abilities, so one that dies
// face down doesn't come back.

export default defineCard({
  name: "Ashcloud Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{4}{R}{R}" },
  text: "Flying\nWhen this creature dies, return it to the battlefield face down under your control.\nMorph {4}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, it deals 2 damage to each player.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", faceDown: true, underYourControl: true },
      resolve: null,
      text: "When this creature dies, return it to the battlefield face down under your control.",
    },
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-player" },
      resolve: null,
      text: "When this creature is turned face up, it deals 2 damage to each player.",
    },
  ],
});
