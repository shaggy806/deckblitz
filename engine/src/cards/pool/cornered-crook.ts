import { defineCard } from "../define.js";

// The optional sacrifice as the trigger resolves, then a reflexive trigger
// (rule 603.12) that picks its target (the ruling) — General Traag's shape.

const ENTER_TEXT =
  "When this creature enters, you may sacrifice an artifact. When you do, this creature deals 3 damage to any target.";

export default defineCard({
  name: "Cornered Crook",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 5,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 3, target: 0 },
          text: "When you do, this creature deals 3 damage to any target.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
