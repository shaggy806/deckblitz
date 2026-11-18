import { defineCard } from "../define.js";

// EDHREC rank 16013.
//
// Rulings:
//   - Cost reducers can be used to reduce the X part of the mana cost.
//   - You may gain up to the total toughness of the creature even if it was
//     already damaged.
//
// "Spend only black mana on X" is `xSpendOnly`. The gain is the damage dealt
// (prevented damage was never dealt), each event capped by what its recipient
// had (`damageDealtThisWay`'s `capped`): the player's life or the
// planeswalker's loyalty just before, the creature's toughness.
const TEXT =
  "Spend only black mana on X.\nDrain Life deals X damage to any target. You gain life equal to the damage dealt, but not more life than the player's life total before the damage was dealt, the planeswalker's loyalty before the damage was dealt, or the creature's toughness.";

export default defineCard({
  name: "Drain Life",
  manaCost: "{X}{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  xSpendOnly: "B",
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "gain-life", amount: { damageDealtThisWay: true, to: 0, capped: true } },
    ],
  },
});
