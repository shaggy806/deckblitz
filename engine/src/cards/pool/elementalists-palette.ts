import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] If you cast a spell with multiple {X} mana symbols in its cost, the first ability
//     triggers only once.
//   [2021-04-16] The mana added by the last ability can be used only to pay costs with at least one
//     {X}, but it can be used to pay for any part of that cost, not just the {X}. That {X} could be
//     in a spell's total cost, an ability's activation cost, or a cost you're asked to pay as a
//     spell or ability resolves.

const TRIGGER_TEXT = "Whenever you cast a spell with {X} in its mana cost, put two charge counters on this artifact.";
const ANY_TEXT = "{T}: Add one mana of any color.";
const CHARGE_TEXT = "{T}: Add {C} for each charge counter on this artifact. Spend this mana only on costs that contain {X}.";

export default defineCard({
  name: "Elementalist's Palette",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${TRIGGER_TEXT}\n${ANY_TEXT}\n${CHARGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { xInManaCost: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 2 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: ANY_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: { countersOn: "source", counter: "charge" },
        spendOnly: {
          purposes: ["cost-with-x"],
          text: "Spend this mana only on costs that contain {X}.",
        },
      },
      resolve: null,
      text: CHARGE_TEXT,
    },
  ],
});
