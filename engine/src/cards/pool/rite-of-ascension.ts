import { defineCard } from "../define.js";

const TEXT =
  "Battlefront — Whenever you attack, for each opponent you attacked this turn, create a tapped and attacking 2/1 red Klingon Warrior creature token with haste.";

export default defineCard({
  name: "Rite of Ascension",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Klingon Warrior Token",
        count: { turnStat: "opponents-attacked" },
        tapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
