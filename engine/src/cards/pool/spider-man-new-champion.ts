import { defineCard } from "../define.js";

// EDHREC rank 16092.
//
// Magmakin Artillerist's discard trigger — once per discard event, "that
// much" the number of cards discarded — at any target.

const DISCARD_TEXT = "Whenever you discard one or more cards, Spider-Man deals that much damage to any target.";

export default defineCard({
  name: "Spider-Man, New Champion",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
