import { defineCard } from "../define.js";

// EDHREC rank 29996.
//
// Rulings:
//   Only one creature can be sacrificed for one +2/+2 per trigger.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. If you do, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Brawl-Bash Ogre",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
