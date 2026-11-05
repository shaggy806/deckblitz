import { defineCard } from "../define.js";

// EDHREC rank 21850.

export default defineCard({
  name: "Wren's Run Vanquisher",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  additionalCost: {
    options: [
      {
        text: "Reveal an Elf card",
        behold: { filter: { subtype: "Elf" }, text: "an Elf card", fromHand: true },
      },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal an Elf card from your hand or pay {3}.\nDeathtouch (Any amount of damage this deals to a creature is enough to destroy it.)",
});
