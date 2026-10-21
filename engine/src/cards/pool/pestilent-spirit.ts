import { defineCard } from "../define.js";

// EDHREC rank 13522. A spell's deathtouch applies to the damage the spell
// itself deals, not to damage it has another object deal (the ruling).
const GRANT_TEXT =
  "Instant and sorcery spells you control have deathtouch. (Any amount of damage they deal to a creature is enough to destroy it.)";

export default defineCard({
  name: "Pestilent Spirit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["menace", "deathtouch"],
  text: `Menace, deathtouch\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, keywords: ["deathtouch"] },
      text: GRANT_TEXT,
    },
  ],
});
