import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 32628.
//
// The payment announces itself with the mana it spent
// (`cumulative-upkeep-paid`'s `manaSpent`), which the trigger reads as the
// mana "spent this way": a generic {1} paid with {B} or {R} counts (rule
// 702.24a — the cost is paid for every age counter at once).

const TEXT = "Whenever this creature's cumulative upkeep is paid, it gets +1/+0 until end of turn for each {B} or {R} spent this way.";

const upkeep = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Balduvian Fallen",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 5,
  text: `${upkeep.text}\n${TEXT}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "event", event: "cumulative-upkeep-paid", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaSpentOf: "this-ability", type: ["B", "R"] },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
