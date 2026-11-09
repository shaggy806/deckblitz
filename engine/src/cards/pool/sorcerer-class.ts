import { defineCard } from "../define.js";
import { CLASS_REMINDER, classLevel } from "../helpers.js";

const INSTANT_OR_SORCERY = { typesAnyOf: ["instant", "sorcery"] } as const;
const MANA_ABILITY = "{T}: Add {U} or {R}. Spend this mana only to cast an instant or sorcery spell or to gain a Class level.";
const DAMAGE_TEXT =
  "Whenever you cast an instant or sorcery spell, that spell deals damage to each opponent equal to the number of instant and sorcery spells you've cast this turn.";

export default defineCard({
  name: "Sorcerer Class",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\nWhen this Class enters, draw two cards, then discard two cards.\n{U}{R}: Level 2\nCreatures you control have "${MANA_ABILITY}"\n{3}{U}{R}: Level 3\n${DAMAGE_TEXT}`,
  activated: [classLevel(2, "{U}{R}"), classLevel(3, "{3}{U}{R}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this Class enters, draw two cards, then discard two cards.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: INSTANT_OR_SORCERY },
      condition: { kind: "class-level", atLeast: 3 },
      targets: [],
      effect: { kind: "damage", who: "each-opponent", from: "trigger-object", amount: { castThisTurn: INSTANT_OR_SORCERY } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "class-level", atLeast: 2 },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: { oneOf: ["U", "R"] },
            amount: 1,
            spendOnly: {
              spell: INSTANT_OR_SORCERY,
              purposes: ["class-level"],
              text: "Spend this mana only to cast an instant or sorcery spell or to gain a Class level.",
            },
          },
          resolve: null,
          text: MANA_ABILITY,
        },
      ],
      text: `Creatures you control have "${MANA_ABILITY}"`,
    },
  ],
});
