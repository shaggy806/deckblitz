import { defineCard } from "../define.js";

const TEXT =
  "Each creature card in your graveyard has scavenge. The scavenge cost is equal to its mana cost. (Exile a creature card from your graveyard and pay its mana cost: Put a number of +1/+1 counters equal to that card's power on target creature. Scavenge only as a sorcery.)";

// EDHREC rank 11769.
export default defineCard({
  name: "Young Deathclaws",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Mutant"],
  power: 4,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "creature" }, keywords: [{ keyword: "scavenge" }] },
      text: TEXT,
    },
  ],
});
