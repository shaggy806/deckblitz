import { defineCard } from "../define.js";

// EDHREC rank 29963.
//
// Rulings:
//   [2016-01-22] Players can respond to the enters-the-battlefield ability (notably, while
//     Harvester Troll is still 2/3), but once that ability starts resolving, it's too late for any
//     player to respond. You don't choose which creature or land you're sacrificing, if any, until
//     the ability resolves.

// "A creature" includes Harvester Troll itself (no "another"), so it isn't
// spared — Undercity Scavenger's shape without `exceptSource`.
const TEXT =
  "When this creature enters, you may sacrifice a creature or land. If you do, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Harvester Troll",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["creature", "land"] }, text: "Sacrifice a creature or land" }],
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
