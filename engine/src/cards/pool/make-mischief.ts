import { defineCard } from "../define.js";

// EDHREC rank 18514. The Devil Token carries its own dies trigger.
export default defineCard({
  name: "Make Mischief",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'Make Mischief deals 1 damage to any target. Create a 1/1 red Devil creature token. It has "When this token dies, it deals 1 damage to any target."',
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "create-token", token: "Devil Token", count: 1 },
    ],
  },
});
