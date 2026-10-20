import { defineCard } from "../define.js";

// "+1/+0, or +3/+1 instead" is +1/+0 always and +2/+1 more while an opponent
// has eight or more cards in their graveyard — the same totals either way.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const BONUS_TEXT =
  "Equipped creature gets +1/+0. It gets +3/+1 instead as long as an opponent has eight or more cards in their graveyard.";

export default defineCard({
  name: "Mind Carver",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${BONUS_TEXT}\nEquip {2}{B}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{B}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 0], text: BONUS_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      grantPt: [2, 1],
      text: BONUS_TEXT,
    },
  ],
});
