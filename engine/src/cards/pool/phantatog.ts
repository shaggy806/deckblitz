import { defineCard } from "../define.js";

// EDHREC rank 20390.

export default defineCard({
  name: "Phantatog",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Atog"],
  power: 1,
  toughness: 2,
  text: "Sacrifice an enchantment: This creature gets +1/+1 until end of turn.\nDiscard a card: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "enchantment" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice an enchantment: This creature gets +1/+1 until end of turn.",
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gets +1/+1 until end of turn.",
    },
  ],
});
