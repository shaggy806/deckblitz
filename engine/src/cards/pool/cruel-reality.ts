import { defineCard } from "../define.js";

// EDHREC rank 10040. Doom Foretold's shape on the enchanted player's upkeep:
// they must sacrifice a creature or planeswalker if they control one (the
// ruling: they can't choose the life loss instead), and lose 5 life only if
// nothing was sacrificed this way.

const TEXT =
  "At the beginning of enchanted player's upkeep, that player sacrifices a creature or planeswalker of their choice. If the player can't, they lose 5 life.";

export default defineCard({
  name: "Cruel Reality",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "active-player", filter: { typesAnyOf: ["creature", "planeswalker"] }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: { kind: "lose-life", amount: 5, who: "active-player" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
