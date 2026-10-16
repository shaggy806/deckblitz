import { defineCard } from "../define.js";

// EDHREC rank 21621. Modern Horizons 3.
//
// Grandeur (Page, Loose Leaf): the discard of another card with its name is
// part of the cost, beside a sacrifice of two Mountains (Sai's `count`), all
// paid as it's activated.

const ENTER_TEXT = "When Skoa enters, it deals 4 damage to any target.";
const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Skoa, Embermage, Sacrifice two Mountains: Skoa deals 4 damage to any target.";

export default defineCard({
  name: "Skoa, Embermage",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${GRANDEUR_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        discard: { count: 1, filter: { name: "Skoa, Embermage" } },
        sacrifice: { filter: { subtype: "Mountain" }, count: 2 },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
