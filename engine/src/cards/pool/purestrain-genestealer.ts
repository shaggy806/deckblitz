import { defineCard } from "../define.js";

// EDHREC rank 11745.
//
// Guiding Hydra's "you may remove a +1/+1 counter … If you do" (rule 608.2c):
// offered only while it's still on the battlefield with a counter to remove,
// so the removal can't fail and the search follows it.

const ENTERS_TEXT = "This creature enters with two +1/+1 counters on it.";
const VANGUARD_TEXT =
  "Vanguard Species — Whenever this creature attacks, you may remove a +1/+1 counter from it. If you do, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Purestrain Genestealer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${VANGUARD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove a +1/+1 counter from Purestrain Genestealer to search for a basic land?",
          effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
          then: {
            kind: "search-library",
            filter: { supertype: "basic", type: "land" },
            destination: "battlefield",
            min: 0,
            max: 1,
            enterTapped: true,
          },
        },
      },
      resolve: null,
      text: VANGUARD_TEXT,
    },
  ],
});
