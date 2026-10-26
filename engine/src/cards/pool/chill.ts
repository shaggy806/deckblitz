import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 21693. Every player's red spells (Gloom's shape).

const TEXT = "Red spells cost {2} more to cast.";

export default defineCard({
  name: "Chill",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["R"] }, increaseGeneric: 2 },
      text: TEXT,
    },
  ],
});
