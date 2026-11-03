import { defineCard } from "../define.js";

export default defineCard({
  name: "Torrent of Stone",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: {
    onto: "arcane",
    cost: "",
    also: { text: "Sacrifice two Mountains", sacrifice: { filter: { subtype: "Mountain" }, count: 2 } },
  },
  text: "Torrent of Stone deals 4 damage to target creature.\nSplice onto Arcane—Sacrifice two Mountains. (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
