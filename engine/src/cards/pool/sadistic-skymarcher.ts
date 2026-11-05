import { defineCard } from "../define.js";

// EDHREC rank 24474.

export default defineCard({
  name: "Sadistic Skymarcher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  additionalCost: {
    options: [
      {
        text: "Reveal a Vampire card",
        behold: { filter: { subtype: "Vampire" }, text: "a Vampire card", fromHand: true },
      },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal a Vampire card from your hand or pay {1}.\nFlying, lifelink",
});
