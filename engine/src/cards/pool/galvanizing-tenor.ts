import { defineCard } from "../define.js";

// EDHREC rank 31662.
//
// X is read as the trigger's targets are chosen, this creature's own attack
// already counted (rule 601.2c via 603.3d).

const GOAD_TEXT =
  "Battlefront — Whenever this creature attacks, goad up to X target creatures, where X is the number of " +
  "opponents you attacked this turn. (Until your next turn, those creatures attack each combat if able and attack " +
  "a player other than you if able.)";

export default defineCard({
  name: "Galvanizing Tenor",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Performer"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${GOAD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: { turnStat: "opponents-attacked" } }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: GOAD_TEXT,
    },
  ],
});
