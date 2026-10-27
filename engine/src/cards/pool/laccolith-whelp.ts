import { defineCard } from "../define.js";

// EDHREC rank 26314.
//
// Rulings:
//   The ability allows you to deal damage during the declare blockers step of combat, which is
//     well before even first strike creatures deal damage.
//   The ability is optional. You can decide to allow it to deal combat damage as normal.
//   It can target any creature on the battlefield, not just one of the ones blocking it.
//   The ability triggers even if a spell or ability makes it blocked, instead of being blocked by
//     a creature.

const TEXT =
  "Whenever this creature becomes blocked, you may have it deal damage equal to its power to target creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Laccolith Whelp",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Laccolith Whelp deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
