import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 11251.
//
// Rulings:
//   [2024-11-08] There's no extra bonus if you control more than one commander.
//   [2024-11-08] The commander you control doesn't have to be your commander.
//   [2024-11-08] To move a counter from one permanent to another, the counter is removed from the
//     first permanent and put onto the second.
//   [2024-11-08] Once you've chosen both modes for the spell, it doesn't matter whether you
//     continue to control a commander.
//
// Both modes are allowed when a commander is controlled as it's cast
// (`maxModesIf`, Drown in Dreams). The draw counts every counter the removal
// took off (`thisWay: "counters-removed"`).
const NONLAND_YOU_CONTROL: TargetSpec = { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } };

export default defineCard({
  name: "Nexus Mentality",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Move all counters from target nonland permanent you control onto another target nonland permanent you control.\n• Remove all counters from target nonland permanent you control. Draw a card for each counter removed this way.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Move all counters from target nonland permanent you control onto another target nonland permanent you control.",
        targets: [NONLAND_YOU_CONTROL, { kind: "other", of: NONLAND_YOU_CONTROL, than: { slot: 0 } }],
        effect: { kind: "move-counters", from: 0, to: 1, amount: "all" },
      },
      {
        text: "Remove all counters from target nonland permanent you control. Draw a card for each counter removed this way.",
        targets: [NONLAND_YOU_CONTROL],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
            { kind: "draw", amount: { thisWay: "counters-removed" } },
          ],
        },
      },
    ],
  },
});
