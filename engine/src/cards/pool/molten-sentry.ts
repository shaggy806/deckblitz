import { defineCard } from "../define.js";

// Its * and * are 0 anywhere but the battlefield.
export default defineCard({
  name: "Molten Sentry",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text:
    "As this creature enters, flip a coin. If the coin comes up heads, this creature enters as a 5/2 creature with " +
    "haste. If it comes up tails, this creature enters as a 2/5 creature with defender.",
  becomesOnEnter: {
    flip: true,
    forms: [
      { label: "5/2 creature with haste", as: { power: 5, toughness: 2, keywords: ["haste"] } },
      { label: "2/5 creature with defender", as: { power: 2, toughness: 5, keywords: ["defender"] } },
    ],
  },
});
