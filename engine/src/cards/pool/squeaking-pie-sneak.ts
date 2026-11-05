import { defineCard } from "../define.js";

// EDHREC rank 28466.

export default defineCard({
  name: "Squeaking Pie Sneak",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["fear"],
  additionalCost: {
    options: [
      {
        text: "Reveal a Goblin card",
        behold: { filter: { subtype: "Goblin" }, text: "a Goblin card", fromHand: true },
      },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal a Goblin card from your hand or pay {3}.\nFear (This creature can't be blocked except by artifact creatures and/or black creatures.)",
});
