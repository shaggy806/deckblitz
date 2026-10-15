import { defineCard } from "../define.js";

// EDHREC rank 22420.
//
// Vigorbloom Charm's counters-then-fight, with two counters.

export default defineCard({
  name: "Troll Negotiations",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature you control. Then it fights target creature an opponent controls. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
