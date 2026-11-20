import { defineCard } from "../define.js";

// EDHREC rank 16071.
//
// A `loseAllAbilities` static with `exceptManaAbilities` (layer 6): each
// land keeps its mana abilities (rule 605.1a), printed or granted, and loses
// the rest — its "enters tapped" too, judged as it would exist (614.12).
//
// Rulings:
//   - If a land has an ability that triggers "when" it enters the battlefield, it will lose that
//     ability before it triggers.
//   - If a land has an ability that continuously changes the types of other lands (such as
//     Urborg, Tomb of Yawgmoth does), that ability will apply before Blood Sun removes that land's
//     abilities. If a land has an ability that grants abilities to other objects, Blood Sun will
//     stop it from doing so.
//   - Land cards not on the battlefield aren't affected.
//   - A mana ability is an ability that produces mana, not an ability that costs mana.
//   - If a land gains an ability after Blood Sun has entered the battlefield, it keeps that
//     ability.
//   - If a land has an ability that causes it to enter the battlefield tapped, it will lose that
//     ability before it applies.

const DRAW = "When this enchantment enters, draw a card.";
const STATIC = "All lands lose all abilities except mana abilities.";

export default defineCard({
  name: "Blood Sun",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${DRAW}\n${STATIC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      loseAllAbilities: true,
      exceptManaAbilities: true,
      text: STATIC,
    },
  ],
});
