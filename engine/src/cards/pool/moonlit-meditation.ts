import { defineCard } from "../define.js";

const TEXT = "The first time you would create one or more tokens each turn, you may instead create that many tokens that are copies of enchanted permanent.";

export default defineCard({
  name: "Moonlit Meditation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature you control\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } }],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        firstEachTurn: true,
        may: true,
        becomes: {
          effect: { kind: "create-token-copy", of: "enchanted", count: "x", who: "you" },
          text: "Create that many tokens that are copies of enchanted permanent",
        },
      },
      text: TEXT,
    },
  ],
});
