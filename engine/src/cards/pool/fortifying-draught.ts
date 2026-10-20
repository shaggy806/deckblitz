import { defineCard } from "../define.js";

// EDHREC rank 18237.
//
// Rulings:
//   [2021-04-16] Fortifying Draught counts the total amount of life gained without considering
//     any life you lost during that turn.
//
// X is the `life-gained` turn stat as the pump applies — after the 2 life
// (and whatever a replacement made of it) has been gained.
export default defineCard({
  name: "Fortifying Draught",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 2 life. Target creature gets +X/+X until end of turn, where X is the amount of life you gained this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2 },
      {
        kind: "modify-pt",
        target: 0,
        power: { turnStat: "life-gained", who: "you" },
        toughness: { turnStat: "life-gained", who: "you" },
        duration: "end-of-turn",
      },
    ],
  },
});
