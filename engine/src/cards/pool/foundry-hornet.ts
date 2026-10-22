import { defineCard } from "../define.js";

// EDHREC rank 25692.
//
// An intervening "if" (rule 603.4), checked as it triggers and again as it
// resolves; the Hornet itself counts (no `excludeSelf`).
//
// Rulings:
//   [2017-02-09] If an effect causes Foundry Hornet to enter the battlefield with a +1/+1 counter
//     on it, it satisfies its own triggered ability.
//   [2017-02-09] If you don't control a creature with a +1/+1 counter as Foundry Hornet enters the
//     battlefield, its ability doesn't trigger. If you control no creatures with a +1/+1 counter
//     as the ability resolves, nothing happens.

const ETB_TEXT =
  "When this creature enters, if you control a creature with a +1/+1 counter on it, creatures your opponents control get -1/-1 until end of turn.";

export default defineCard({
  name: "Foundry Hornet",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        atLeast: 1,
      },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
