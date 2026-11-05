import { defineCard } from "../define.js";

// EDHREC rank 30156.

export default defineCard({
  name: "Flamekin Bladewhirl",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      {
        text: "Reveal an Elemental card",
        behold: { filter: { subtype: "Elemental" }, text: "an Elemental card", fromHand: true },
      },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal an Elemental card from your hand or pay {3}.",
});
