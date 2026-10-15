import { defineCard } from "../define.js";

// Cut Propulsion's self-damage (the creature is the source), then
// Unlicensed Disintegration's damage to the target's controller — from
// Wisecrack itself — if it's attacking as that sentence is performed.
export default defineCard({
  name: "Wisecrack",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature deals damage equal to its power to itself. If that creature is attacking, Wisecrack deals 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { attacking: true } },
        then: { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      },
    ],
  },
});
