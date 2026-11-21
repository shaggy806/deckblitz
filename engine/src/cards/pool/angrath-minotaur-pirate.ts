import { defineCard } from "../define.js";

// EDHREC rank 17573. The −11's "their total power" is every creature that
// player controlled: the ones destroyed read as they last existed (rule
// 608.2h), any that weren't (indestructible, regenerated) as they are now —
// a signed `sum` of two aggregates, so a negative power lowers the total and
// only the damage itself is clamped at 0 (rule 107.1b; the rulings).

const PLUS_TEXT =
  "+2: Angrath deals 1 damage to target opponent or planeswalker and each creature that player or that planeswalker's controller controls.";
const MINUS_THREE_TEXT = "−3: Return target Pirate card from your graveyard to the battlefield.";
const ULTIMATE_TEXT =
  "−11: Destroy all creatures target opponent controls. Angrath deals damage to that player equal to their total power.";

export default defineCard({
  name: "Angrath, Minotaur Pirate",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Angrath"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_THREE_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["opponent-or-planeswalker"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: 1, controlledByTarget: 0 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Pirate" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -11,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
          {
            kind: "damage",
            target: 0,
            amount: {
              sum: [
                { aggregate: "sum", of: "power", filter: {}, in: { thisWay: "destroyed" } },
                { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" }, forTarget: 0 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
});
