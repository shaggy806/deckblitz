import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24720.
//
// Resuscitate's shape over every creature: the creatures are fixed as it
// resolves (rule 611.2c), so one entering later doesn't gain the ability.
// Each one's ability deals its own damage (Dead Before Sunrise's ability).

const ABILITY = "{T}: This creature deals damage equal to its power to target creature.";

export default defineCard({
  name: "Brawl",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Until end of turn, all creatures gain "${ABILITY}"`,
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { type: "creature" },
    ability: {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: ABILITY,
    },
    duration: "end-of-turn",
  },
});
