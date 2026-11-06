import { defineCard } from "../define.js";

// EDHREC rank 31430.

export default defineCard({
  name: "Cloistered Telepath",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Talosian", "Advisor"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, draw a card, then discard a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "When this creature enters, draw a card, then discard a card.",
    },
  ],
});
