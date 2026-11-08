import { defineCard } from "../define.js";

const ALONE = "This creature can only attack alone.";
const CRUELTY =
  "Whenever this creature attacks a player and isn't blocked, that player's life total becomes 1. This creature assigns no combat damage this combat.";

// "Attacks a player": not a planeswalker or a battle (`attackingPlayer`).
// "This combat", not this turn: an extra combat later this turn, it deals its
// damage as ever.
export default defineCard({
  name: "Master of Cruelties",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 1,
  toughness: 4,
  keywords: ["first-strike", "deathtouch"],
  text: `First strike, deathtouch\n${ALONE}\n${CRUELTY}`,
  static: [{ affects: { scope: "self" }, restrictions: ["can-only-attack-alone"], text: ALONE }],
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self", filter: { attackingPlayer: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "set-life-total", who: "trigger-player", amount: 1 },
          { kind: "assigns-no-combat-damage", target: "source", duration: "until-end-of-combat" },
        ],
      },
      resolve: null,
      text: CRUELTY,
    },
  ],
});
