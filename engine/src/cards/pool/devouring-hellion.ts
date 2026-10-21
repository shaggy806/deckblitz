import { defineCard } from "../define.js";

// EDHREC rank 25429. Devour's machinery (rule 702.82 — the same "as this
// enters, you may sacrifice any number of …, it enters with N +1/+1 counters
// for each"), over creatures and planeswalkers: asked as it's about to enter
// (rule 614.12), from the permanents already on the battlefield (the rulings).

export default defineCard({
  name: "Devouring Hellion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 2,
  toughness: 2,
  text: "As this creature enters, you may sacrifice any number of creatures and/or planeswalkers. If you do, it enters with twice that many +1/+1 counters on it.",
  devour: { multiplier: 2, filter: { typesAnyOf: ["creature", "planeswalker"] } },
});
