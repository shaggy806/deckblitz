import { defineCard } from "../define.js";

// EDHREC rank 25146.
//
// Ruling: it gives 1 life for each black mana used, but not more life than
// the unprevented damage dealt.
//
// "Spend only black and/or red mana on X" is `xSpendOnly: ["B", "R"]`: each X
// a symbol paid with black or red. The gain is Drain Life's — the damage dealt,
// each event capped by what its recipient had — and no more than the black
// spent on X (`{ manaSpentOnX: "B" }`).
const TEXT =
  "Spend only black and/or red mana on X.\nSoul Burn deals X damage to any target. You gain life equal to the damage dealt, but not more than the amount of {B} spent on X, the player's life total before the damage was dealt, the planeswalker's loyalty before the damage was dealt, or the creature's toughness.";

export default defineCard({
  name: "Soul Burn",
  manaCost: "{X}{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  xSpendOnly: ["B", "R"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "gain-life",
        amount: { leastOf: [{ damageDealtThisWay: true, to: 0, capped: true }, { manaSpentOnX: "B" }] },
      },
    ],
  },
});
