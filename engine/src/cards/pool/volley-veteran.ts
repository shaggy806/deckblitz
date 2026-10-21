import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, it deals damage to target creature an opponent controls equal to the number of Goblins you control.";

// Counted as the trigger resolves, itself included while it's still there
// (the ruling).
export default defineCard({
  name: "Volley Veteran",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Goblin", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
