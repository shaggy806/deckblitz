import { defineCard } from "../define.js";

// EDHREC rank 7751. Modern Horizons 3.
// Makes Eldrazi Spawn → "Eldrazi Spawn Token".
//
// Devoid: colourless in every zone (`colors: []`); its colour identity is
// still red, read from the mana cost. The cast trigger resolves before the
// spell, and still does if the spell is countered (the ruling). "Sacrifice an
// Eldrazi" may be this creature itself; the damage is then dealt by it as it
// last existed.

const CAST_TEXT =
  'When you cast this spell, create three 0/1 colorless Eldrazi Spawn creature tokens with "Sacrifice this token: Add {C}."';
const PING_TEXT = "{1}{C}, Sacrifice an Eldrazi: This creature deals 2 damage to any target.";

export default defineCard({
  name: "Spawn-Gang Commander",
  manaCost: "{3}{R}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Goblin"],
  power: 2,
  toughness: 2,
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 3 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{C}", tap: false, sacrifice: { filter: { subtype: "Eldrazi" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
