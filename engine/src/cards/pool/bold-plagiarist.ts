import { defineCard } from "../define.js";

// Commander 2021 (C21). EDHREC rank 15976.
//
// Once per creature per placement (rule 603.2c), only for counters an
// opponent put on a creature they control (`byItsController`): the counters
// that fired it, every kind put at once, go on this creature — put by that
// opponent (`as-player` the trigger player, who put them), so their own Bold
// Plagiarist doesn't trigger on it (the ruling) and a doubler of theirs that
// reads who puts counters would apply. An opponent who has left the game puts
// nothing.
//
// Rulings:
//   Your opponent places the counters on both permanents. Therefore, if they also control a Bold
//     Plagiarist, its ability will not trigger.
const TEXT =
  "Whenever an opponent puts one or more counters on a creature they control, they put the same number and kind of counters on this creature.";

export default defineCard({
  name: "Bold Plagiarist",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "opponent", filter: { type: "creature" }, byItsController: true },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-player",
        effect: { kind: "put-counters-of", of: "trigger-placement", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
