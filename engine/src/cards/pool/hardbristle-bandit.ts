import { defineCard } from "../define.js";

// EDHREC rank 8247.

export default defineCard({
  name: "Hardbristle Bandit",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{T}: Add one mana of any color.\nWhenever you commit a crime, untap this creature. This ability triggers only once each turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever you commit a crime, untap this creature. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
