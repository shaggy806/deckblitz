import { defineCard } from "../define.js";

// EDHREC rank 11479. Zendikar Rising.
//
// The kicked counters are an enters replacement reading `self-kicked`
// (Shalai's Acolyte's shape) over the nonbasic lands its controller's
// opponents control as it enters. The targeted trigger is Dream Strix's, and
// the tokens come whether or not the sacrifice happened, as many as its power
// as it last existed on the battlefield (the rulings).

const ENTER_TEXT =
  "If this creature was kicked, it enters with a +1/+1 counter on it for each nonbasic land your opponents control.";
const TARGET_TEXT =
  "When this creature becomes the target of a spell, sacrifice it and create a number of 1/1 colorless Construct artifact creature tokens equal to its power.";

export default defineCard({
  name: "Myriad Construct",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: `Kicker {3}\n${ENTER_TEXT}\n${TARGET_TEXT}`,
  kicker: { cost: "{3}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "self-kicked" },
            then: { countOf: { type: "land", notSupertype: "basic", controlledBy: "opponent" } },
            else: 0,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          {
            kind: "create-token",
            token: "Construct Token (Jan Jansen, Chaos Crafter)",
            count: { powerOf: "source" },
          },
        ],
      },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
