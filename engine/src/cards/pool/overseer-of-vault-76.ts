import { defineCard } from "../define.js";

// EDHREC rank 10744.
//
// First Contact is one ability with two trigger events — Overseer itself
// entering (whatever its power), or another creature you control with power 3
// or less. "You may remove three quest counters from among permanents you
// control": exactly three (its ruling), chosen as it resolves; with fewer
// there, only as many as there are come off (rule 609.3), and the reflexive
// "when you do" needs all three.

const FIRST_CONTACT_TEXT =
  "First Contact — Whenever Overseer of Vault 76 or another creature you control with power 3 or less enters, put a quest counter on Overseer of Vault 76.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may remove three quest counters from among permanents you control. When you do, put a +1/+1 counter on each creature you control and they gain vigilance until end of turn.";

export default defineCard({
  name: "Overseer of Vault 76",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  text: `${FIRST_CONTACT_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      resolve: null,
      text: FIRST_CONTACT_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", power: { op: "lte", n: 3 } },
      },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      resolve: null,
      text: FIRST_CONTACT_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove three quest counters from among permanents you control?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counters", from: {}, counter: "quest", count: 3, among: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "counters-removed", atLeast: 3 },
              then: {
                kind: "reflexive-trigger",
                targets: [],
                effect: {
                  kind: "sequence",
                  effects: [
                    {
                      kind: "add-counter-all",
                      filter: { type: "creature", controlledBy: "you" },
                      counter: "+1/+1",
                      amount: 1,
                    },
                    {
                      kind: "grant-keyword-all",
                      filter: { type: "creature", controlledBy: "you" },
                      keyword: "vigilance",
                      duration: "end-of-turn",
                    },
                  ],
                },
                text: "Put a +1/+1 counter on each creature you control and they gain vigilance until end of turn.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
