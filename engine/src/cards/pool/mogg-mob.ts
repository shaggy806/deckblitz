import { defineCard } from "../define.js";

// EDHREC rank 15564.
//
// Skarrgan Hellkite's divided damage on an activated ability: how many
// targets and the split are chosen as it's activated, at least 1 each, and
// a target gone illegal loses its share (the rulings). The Mob is the source
// as it last existed on the battlefield.
const TEXT = "Sacrifice this creature: It deals 3 damage divided as you choose among one, two, or three targets.";

export default defineCard({
  name: "Mogg Mob",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
      divided: { total: 3, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
