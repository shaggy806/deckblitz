import { defineCard } from "../define.js";

// EDHREC rank 6420. "A spell or ability you control" is `byControllerOnly`
// (event.by is this permanent's controller); "an opponent controls" is the
// filter, read from Willbreaker's controller's side. The steal is Master
// Thief's `whileYouControlSource`: nothing if you don't control Willbreaker
// as it resolves, and it ends for good once another player gains control.
//
// Rulings:
//   [2015-06-22] If you lose control of Willbreaker before its ability resolves, you won't gain
//     control of the creature at all.
//   [2015-06-22] If Willbreaker leaves the battlefield, you no longer control it, and its
//     control-change effect ends.
//   [2015-06-22] If another player gains control of Willbreaker, its control-change effect ends.
//     Regaining control of Willbreaker won't cause you to regain control of the creature.

const TEXT =
  "Whenever a creature an opponent controls becomes the target of a spell or ability you control, gain control of that creature for as long as you control this creature.";

export default defineCard({
  name: "Willbreaker",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "any",
        filter: { type: "creature", controlledBy: "opponent" },
        byControllerOnly: true,
      },
      targets: [],
      effect: { kind: "gain-control", target: "trigger-object", untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
