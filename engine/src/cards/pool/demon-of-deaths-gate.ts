import { defineCard } from "../define.js";

// Magic 2011 (M11). EDHREC rank 13703.
//
// "You may pay 6 life and sacrifice three black creatures rather than pay
// this spell's mana cost": an alternative cost (rule 118.9) — the life with
// the sacrifice, the creatures chosen as the cost is paid (601.2h). It
// doesn't change when it can be cast, nor its mana value (rulings).

export default defineCard({
  name: "Demon of Death's Gate",
  manaCost: "{6}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "trample"],
  text: "You may pay 6 life and sacrifice three black creatures rather than pay this spell's mana cost.\nFlying, trample",
  alternativeCost: {
    mana: "{0}",
    payLife: 6,
    sacrifice: { filter: { type: "creature", colors: ["B"] }, count: 3, text: "three black creatures" },
  },
});
