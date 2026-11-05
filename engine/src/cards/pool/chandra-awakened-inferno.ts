import { defineCard } from "../define.js";

// Each opponent owns their emblem, and burns at their own upkeep, whatever becomes
// of Chandra (the rulings). The exile rider needs damage dealt, and catches the
// permanent dying any way this turn (the rulings).
const EMBLEM_TRIGGER = "At the beginning of your upkeep, this emblem deals 1 damage to you.";
const EMBLEM_TEXT = `+2: Each opponent gets an emblem with "${EMBLEM_TRIGGER}"`;
const SWEEP_TEXT = "−3: Chandra deals 3 damage to each non-Elemental creature.";
const BOLT_TEXT = "−X: Chandra deals X damage to target creature or planeswalker. If a permanent dealt damage this way would die this turn, exile it instead.";

export default defineCard({
  name: "Chandra, Awakened Inferno",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 6,
  cantBeCountered: true,
  text: `This spell can't be countered.\n${EMBLEM_TEXT}\n${SWEEP_TEXT}\n${BOLT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "create-emblem",
            text: EMBLEM_TRIGGER,
            triggered: [
              {
                trigger: { on: "step-begins", step: "upkeep", who: "you" },
                targets: [],
                effect: { kind: "damage", amount: 1, who: "you" },
                resolve: null,
                text: EMBLEM_TRIGGER,
              },
            ],
          },
        },
      },
      resolve: null,
      text: EMBLEM_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "damage-all", amount: 3, filter: { type: "creature", notSubtypes: ["Elemental"] } },
      resolve: null,
      text: SWEEP_TEXT,
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "permanent" },
        ],
      },
      resolve: null,
      text: BOLT_TEXT,
    },
  ],
});
