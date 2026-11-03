import { defineCard } from "../define.js";

// A spell's keyword from a static, read as the spell resolves: gone from the
// battlefield by then, it gives no rebound.

const TEXT =
  "Instant and sorcery spells you control have rebound. (Exile the spell as it resolves if you cast it from your hand. At the beginning of your next upkeep, you may cast that card from exile without paying its mana cost.)";

export default defineCard({
  name: "Cast Through Time",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { keywords: ["rebound"], filter: { typesAnyOf: ["instant", "sorcery"] } },
      text: TEXT,
    },
  ],
});
