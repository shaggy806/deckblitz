import { defineCard } from "../define.js";

// EDHREC rank 22336. "Whenever you attack" fires once per declaration (Most
// Valuable Slayer's shape); the target is an attacking Goblin of yours.

const TEXT = "Whenever you attack, target attacking Goblin you control gets +1/+0 until end of turn.";

export default defineCard({
  name: "Boggart Prankster",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", subtype: "Goblin", attacking: true, controlledBy: "you" },
        },
      ],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
