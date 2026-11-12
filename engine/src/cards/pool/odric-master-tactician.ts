import { defineCard } from "../define.js";

// EDHREC rank 2501. Battalion-style trigger at four attackers (Firefist Striker's `whileCondition`,
// read as the creatures are declared: a trigger condition, not an intervening "if"). Its effect is
// Master Warcraft's blocking half, `choose-combat` with `thisCombat`: the choice ends as this combat
// does, so an additional combat's blocks are their controllers' again.
//
// Rulings:
//   All blocking declarations must still be legal.
//   If there's a cost associated with having a creature block and you choose for that creature to
//     block, its controller can choose to pay that cost or not. If that player decides to not pay
//     that cost, you must propose a new set of blocking creatures.
//   You can decide that a creature won't block.

const TEXT =
  "Whenever Odric and at least three other creatures attack, you choose which creatures block this combat and how those creatures block.";

export default defineCard({
  name: "Odric, Master Tactician",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 4 },
      targets: [],
      effect: { kind: "choose-combat", blocks: "all", thisCombat: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
