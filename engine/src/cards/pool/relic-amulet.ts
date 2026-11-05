import { defineCard } from "../define.js";

// EDHREC rank 19694.
//
// Rulings:
//   [2019-01-25] A Wizard spell is one with the creature type Wizard.
//   [2019-01-25] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger, but after targets have been chosen for that spell.
//
// "Remove all charge counters" is a cost of every one there (`count: "all"`,
// none at all a legal payment), its number the ability's X, fixed as it's paid.
const CAST_TEXT = "Whenever you cast an instant, sorcery, or Wizard spell, put a charge counter on this artifact.";
const DAMAGE_TEXT =
  "{2}, {T}, Remove all charge counters from this artifact: It deals that much damage to target creature.";

export default defineCard({
  name: "Relic Amulet",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CAST_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: "all" } },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
