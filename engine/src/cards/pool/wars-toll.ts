import { defineCard } from "../define.js";

const TAP = "Whenever an opponent taps a land for mana, tap all lands that player controls.";
const ATTACK = "If a creature an opponent controls attacks, all creatures that opponent controls attack if able.";

export default defineCard({
  name: "War's Toll",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TAP}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "opponent", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "tap-all",
        filter: { type: "land", controlledByRef: "trigger-player" },
      },
      resolve: null,
      text: TAP,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      restrictions: [{ kind: "must-attack", ifAttacks: { type: "creature", controlledBy: "opponent" } }],
      text: ATTACK,
    },
  ],
});
