import { defineCard } from "../define.js";

// EDHREC rank 12409. The enchanted permanent is only an artifact (setTypes:
// no longer a creature or planeswalker, and their subtypes go with them —
// rule 205.1a) and only a Clue among artifact types; the granted Clue ability
// comes from the same static, so it stays.

const STATIC_TEXT =
  'Enchanted permanent is a colorless Clue artifact with "{2}, Sacrifice this artifact: Draw a card" and loses all other abilities. (It\'s no longer a creature or planeswalker.)';

export default defineCard({
  name: "In Too Deep",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  splitSecond: true,
  text: `Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nEnchant creature, planeswalker, or Clue\n${STATIC_TEXT}`,
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ typesAnyOf: ["creature", "planeswalker"] }, { subtype: "Clue" }] },
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["artifact"],
      setSubtypes: ["Clue"],
      setColors: [],
      loseAllAbilities: true,
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{2}, Sacrifice this artifact: Draw a card.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
