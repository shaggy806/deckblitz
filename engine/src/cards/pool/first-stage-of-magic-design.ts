import { defineCard } from "../define.js";

// Playtest card.

export default defineCard({
  name: "First Stage of Magic Design",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["instant"],
  text: "You gain 3 life. Draw three cards. Add {B}{B}{B}. This spell deals 3 damage to any target. Target creature gets +3/+3 until end of turn.",
  targets: ["any-target", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 3 },
      { kind: "draw", amount: 3 },
      { kind: "add-mana", mana: "B", amount: 3 },
      { kind: "damage", amount: 3, target: 0 },
      { kind: "modify-pt", target: 1, power: 3, toughness: 3, duration: "end-of-turn" },
    ],
  },
});
