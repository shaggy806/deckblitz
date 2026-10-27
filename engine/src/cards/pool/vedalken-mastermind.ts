import { defineCard } from "../define.js";

// EDHREC rank 17982.

export default defineCard({
  name: "Vedalken Mastermind",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 2,
  text: "{U}, {T}: Return target permanent you control to its owner's hand.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{U}, {T}: Return target permanent you control to its owner's hand.",
    },
  ],
});
