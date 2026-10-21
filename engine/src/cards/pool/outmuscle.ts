import { defineCard } from "../define.js";

// Vigorbloom Charm's counter-then-fight, then adamant's indestructible on the
// creature you control — before state-based actions, so it survives the
// fight (its rulings).
const ADAMANT =
  "Adamant — If at least three green mana was spent to cast this spell, the creature you control gains indestructible until end of turn.";

export default defineCard({
  name: "Outmuscle",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Put a +1/+1 counter on target creature you control, then it fights target creature you don't control. (Each deals damage equal to its power to the other.)\n${ADAMANT}`,
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "fight", a: 0, b: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { G: 3 } } },
        then: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      },
    ],
  },
});
