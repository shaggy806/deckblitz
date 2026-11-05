import { defineCard } from "../define.js";

// EDHREC rank 22795.

export default defineCard({
  name: "Daring Buccaneer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  additionalCost: {
    options: [
      {
        text: "Reveal a Pirate card",
        behold: { filter: { subtype: "Pirate" }, text: "a Pirate card", fromHand: true },
      },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal a Pirate card from your hand or pay {2}.",
});
