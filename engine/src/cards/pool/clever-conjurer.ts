import { defineCard } from "../define.js";

// EDHREC rank 9684.
//
// "Not named Clever Conjurer" is a name check, not "another": a copy or a
// mutated pile that doesn't have the name can target itself (the ruling).
// `notName` reads the name the permanent has now.

export default defineCard({
  name: "Clever Conjurer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Gnome", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Mage Hand — {T}: Untap target permanent not named Clever Conjurer. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { notName: "Clever Conjurer" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "Mage Hand — {T}: Untap target permanent not named Clever Conjurer. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
