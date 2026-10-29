import { defineCard } from "../define.js";

// Commander 2013 (C13). EDHREC rank 15781.
//
// X is announced as it's activated, with the mode (rule 700.2b), and pays both
// the {X} and the counters removed (the ruling). Every mode says "X can't be
// 0", so the ability's X is at least 1. With no mana spent to cast it (put
// onto the battlefield another way), it enters with no counters.
const ENTERS_TEXT =
  "Marath enters with a number of +1/+1 counters on it equal to the amount of mana spent to cast it.";

export default defineCard({
  name: "Marath, Will of the Wild",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n{X}, Remove X +1/+1 counters from Marath: Choose one —\n• Put X +1/+1 counters on target creature. X can't be 0.\n• Marath deals X damage to any target. X can't be 0.\n• Create an X/X green Elemental creature token. X can't be 0.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false, removeCounter: { kind: "+1/+1", count: "x" } },
      minX: 1,
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put X +1/+1 counters on target creature. X can't be 0.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
          },
          {
            text: "Marath deals X damage to any target. X can't be 0.",
            targets: ["any-target"],
            effect: { kind: "damage", amount: "x", target: 0 },
          },
          {
            text: "Create an X/X green Elemental creature token. X can't be 0.",
            effect: {
              kind: "create-token",
              token: "Elemental Token (Dance of the Tumbleweeds)",
              count: 1,
              basePt: { power: "x", toughness: "x" },
            },
          },
        ],
      },
      resolve: null,
      text: "{X}, Remove X +1/+1 counters from Marath: Choose one —\n• Put X +1/+1 counters on target creature. X can't be 0.\n• Marath deals X damage to any target. X can't be 0.\n• Create an X/X green Elemental creature token. X can't be 0.",
    },
  ],
});
