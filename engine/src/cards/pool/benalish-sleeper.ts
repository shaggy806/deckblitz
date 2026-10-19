import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 16610.
//
// Nullpriest of Oblivion's "if it was kicked" intervening-if, on Innocent
// Blood's edict: each player, the active player first, chooses a creature,
// then all are sacrificed at once — the Sleeper itself may be yours (the
// rulings).
const KICKED_TEXT =
  "When this creature enters, if it was kicked, each player sacrifices a creature of their choice.";

export default defineCard({
  name: "Benalish Sleeper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Soldier"],
  power: 3,
  toughness: 1,
  text: `Kicker {B} (You may pay an additional {B} as you cast this spell.)\n${KICKED_TEXT}`,
  kicker: { cost: "{B}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: KICKED_TEXT,
    },
  ],
});
