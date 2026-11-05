import { defineCard } from "../define.js";

// EDHREC rank 26369.

export default defineCard({
  name: "Slipstream Eel",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish", "Beast"],
  power: 6,
  toughness: 6,
  cycling: { cost: "{1}{U}" },
  text: "This creature can't attack unless defending player controls an Island.\nCycling {1}{U} ({1}{U}, Discard this card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
  ],
});
