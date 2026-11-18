import { defineCard } from "../define.js";

// Unfinity (UNF). EDHREC rank 15083.
//
// Rulings:
//   You choose which roll to ignore after seeing all the results. The ignored roll is considered
//     never to have happened. It can't cause any abilities to trigger, and no effect will see its
//     result.
//
// A resolved `would-roll-dice` replacement for the target player's next roll this turn (`next`,
// `players`): one more die, and `ignoreChosen` — this ability's controller picks one of the
// results to ignore once they're thrown (rule 706.6), before any reroll or shift of the roll.
const ABILITY_TEXT =
  "{1}, {T}: The next time target player would roll one or more dice this turn, instead they roll that many dice plus one and you choose one of those rolls to ignore.";

export default defineCard({
  name: "Bamboozling Beeble",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beeble"],
  power: 1,
  toughness: 1,
  text: `Protection from Robots\n${ABILITY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Robot" } },
      text: "Protection from Robots",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["player"],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        players: { target: 0 },
        replacement: { event: "would-roll-dice", who: "any-player", instead: { modify: { plus: 1 } }, ignoreChosen: true },
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
