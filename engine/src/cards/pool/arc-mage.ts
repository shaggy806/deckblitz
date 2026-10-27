import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 30624.
//
// Rulings:
//   [2004-10-04] You can't choose zero targets. You must choose between 1 and 2 targets.
//
// A Spellshaper (Ridged Kusite's cost) with Mogg Mob's divided damage on an
// activated ability: the targets and the split are chosen as it's activated.

const TEXT =
  "{2}{R}, {T}, Discard a card: This creature deals 2 damage divided as you choose among one or two targets.";

export default defineCard({
  name: "Arc Mage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
      divided: { total: 2, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
