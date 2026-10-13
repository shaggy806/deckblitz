import { defineCard } from "../define.js";

// EDHREC rank 10652.
// Makes Warrior → "Red Warrior Token".

const ANTHEM_TEXT = "Creatures you control get +1/+0.";
const ATTACK_TEXT =
  "Whenever you attack, create a 1/1 red Warrior creature token that's tapped and attacking. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "War Effort",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 0], text: ANTHEM_TEXT }],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      // The token attacks a player or planeswalker of its controller's
      // choice (rule 508.4), as mobilize's do.
      effect: {
        kind: "create-token",
        token: "Red Warrior Token",
        count: 1,
        tapped: true,
        attacking: "choose",
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
