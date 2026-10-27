import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 31271.
//
// Rulings:
//   [2004-10-04] It can target any creature on the battlefield, not just one of the ones blocking
//     it.
//   [2004-10-04] The ability triggers even if a spell or ability makes it blocked, instead of
//     being blocked by a creature.
//   [2004-10-04] The ability is optional. You can decide to allow it to deal combat damage as
//     normal.
//
// Dwarven Vigilantes' shape on a becomes-blocked trigger.

const TEXT =
  "Whenever this creature becomes blocked, you may have it deal damage equal to its power to target creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Laccolith Warrior",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Laccolith Warrior deal damage equal to its power to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
