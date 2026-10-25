import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT = "Constellation — Whenever this creature or another enchantment you control enters, target player mills two cards.";

export default defineCard({
  name: "Thassa's Devourer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 6,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    }),
  ],
});
