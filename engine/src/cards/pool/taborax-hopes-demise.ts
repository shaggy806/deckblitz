import { defineCard } from "../define.js";

// EDHREC rank 6968.
//
// Rulings:
//   [2020-09-25] If Taborax is dealt lethal damage at the same time as one or more nontoken
//     creatures you control die or are dealt lethal damage, it won't receive a counter from its
//     ability in time to save it.
//   [2020-09-25] If another nontoken Cleric dies at the same time as Taborax, you won't put a
//     +1/+1 counter on anything, but you may draw a card as its last ability resolves. You still
//     lose 1 life if you do.
//
// "If that creature was a Cleric" asks the creature as it last existed on the
// battlefield (the `trigger-object` condition, rule 608.2h); the counter and
// the draw are separate, so a Taborax that died alongside it still offers the
// draw (the second ruling). "If you do" is the draw having been chosen.
const LIFELINK_TEXT = "Taborax has lifelink as long as it has five or more +1/+1 counters on it.";
const DIES_TEXT =
  "Whenever another nontoken creature you control dies, put a +1/+1 counter on Taborax. If that creature was a Cleric, you may draw a card. If you do, you lose 1 life.";

export default defineCard({
  name: "Taborax, Hope's Demise",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${LIFELINK_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 5 } },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtype: "Cleric" } },
            then: {
              kind: "may",
              prompt: "Draw a card and lose 1 life?",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 1 },
                  { kind: "lose-life", who: "you", amount: 1 },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
