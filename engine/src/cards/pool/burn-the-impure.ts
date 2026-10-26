import { defineCard } from "../define.js";

// An illegal target fizzles the whole spell, infect or not (the ruling).
export default defineCard({
  name: "Burn the Impure",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Burn the Impure deals 3 damage to target creature. If that creature has infect, Burn the Impure deals 3 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { keyword: "infect" } },
        then: { kind: "damage", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
