import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Mandatory (ruling): with no other legal player, you target yourself.
const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, exile target player's graveyard.";

export default defineCard({
  name: "Agent of Erebos",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["player"],
      effect: { kind: "exile-graveyard", target: 0 },
      resolve: null,
      text: TEXT,
    }),
  ],
});
