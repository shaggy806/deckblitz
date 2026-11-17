import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 11238.
//
// The `putCounter` option with `times`: one +1/+1 counter per age counter,
// each on a creature an opponent controls chosen for it (the same one again,
// or another of any opponent's), none targeted. With no opponent's creature
// it can't be paid at all, so it's sacrificed (rule 702.24a: no partial
// payments).
//
// Rulings:
//   - If no opponent controls a creature, you can't pay the upkeep and must sacrifice Sheltering
//     Ancient.
//   - You may choose a different creature to put each counter on, but you can also choose the
//     same creature multiple times. The creatures don't have to be controlled by the same
//     opponent.
//   - Creatures that can't be the target of abilities can have +1/+1 counters put on them by
//     Sheltering Ancient's cumulative upkeep ability because it doesn't target them. The same is
//     true for creatures with protection from green or protection from any other quality
//     Sheltering Ancient has.
//   - Paying cumulative upkeep is always optional. If it's not paid, the permanent with
//     cumulative upkeep is sacrificed. Partial payments of the total cumulative upkeep cost can't
//     be made.

const upkeep = cumulativeUpkeep({
  putCounter: "+1/+1",
  on: { type: "creature", controlledBy: "opponent" },
  text: "Put a +1/+1 counter on a creature an opponent controls",
});

export default defineCard({
  name: "Sheltering Ancient",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${upkeep.text}`,
  triggered: [upkeep],
});
