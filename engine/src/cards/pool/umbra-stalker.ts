import { defineCard } from "../define.js";

const TEXT = "Chroma — Umbra Stalker's power and toughness are each equal to the number of black mana symbols in the mana costs of cards in your graveyard.";

// A characteristic-defining ability (rule 604.3): in the graveyard its own
// symbols count (the ruling).
export default defineCard({
  name: "Umbra Stalker",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "sum", of: { manaSymbols: "B" }, filter: { ownedBy: "you" }, in: "graveyards" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
