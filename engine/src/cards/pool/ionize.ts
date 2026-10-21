import { defineCard } from "../define.js";

// EDHREC rank 7661. Guilds of Ravnica. Undermine's shape, as damage: the
// damage is read off the targeted spell's controller whether or not it was
// countered (the ruling: an uncounterable spell still costs its controller 2).

export default defineCard({
  name: "Ionize",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target spell. Ionize deals 2 damage to that spell's controller.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
