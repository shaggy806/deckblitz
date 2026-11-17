import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP). EDHREC rank 11691.
//
// The cumulative upkeep's `choose` cost: one land you don't control per age
// counter, each a different one, chosen together as it resolves (none
// targeted) and kept for good; with fewer lands you don't control than age
// counters it can't be paid, so it's sacrificed (rule 702.24a: no partial
// payments). "Don't own" is `ownedBy: "opponent"` (anyone else). The
// leaves-the-battlefield trigger hands back every land its controller has but
// doesn't own, however it was taken.
//
// Rulings:
//   - When Herald of Leshrac's cumulative upkeep ability resolves, if its age counters outnumber
//     the number of lands on the battlefield that you don't control, you can't pay its cumulative
//     upkeep cost and must sacrifice it.
//   - Herald of Leshrac's leaves-the-battlefield ability affects all lands you control but don't
//     own, not just the ones you gained control of with Herald of Leshrac. For example, if you had
//     gained control of an opponent's land with Annex, its owner will regain control of that land.
//     Annex will remain attached to it, but its effect will be overridden.
//   - You must choose a different land you don't control for each age counter on Herald of
//     Leshrac. Otherwise, you'd try to gain control of a land you *do* control midway through
//     paying the cost and need to back up.
//   - The cumulative upkeep trigger doesn't target what you gain control of, and you don't choose
//     lands until the ability resolves. Your opponents can not tap lands in response to the
//     choice, but they could respond to the ability by tapping any number of lands before you've
//     made any choices.

const upkeep = cumulativeUpkeep({
  choose: { type: "land", controlledBy: "opponent" },
  then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
  text: "Gain control of a land you don't control",
});

const PUMP_TEXT = "This creature gets +1/+1 for each land you control but don't own.";
const LEAVES_TEXT =
  "When this creature leaves the battlefield, each player gains control of each land they own that you control.";

export default defineCard({
  name: "Herald of Leshrac",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${upkeep.text}\n${PUMP_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "land", controlledBy: "you", ownedBy: "opponent" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    upkeep,
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-control-all",
        filter: { type: "land", controlledBy: "you", ownedBy: "opponent" },
        untilEndOfTurn: false,
        who: "owner",
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
