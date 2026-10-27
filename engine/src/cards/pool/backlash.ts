import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 12177. Traitor's Roar's shape: being untapped is a
// targeting restriction (the ruling), so a target tapped before resolution is illegal.

export default defineCard({
  name: "Backlash",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Tap target untapped creature. That creature deals damage equal to its power to its controller.",
  targets: [{ kind: "permanent", filter: { tapped: false, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0, from: { target: 0 } },
    ],
  },
});
