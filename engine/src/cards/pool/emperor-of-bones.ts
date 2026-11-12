import { defineCard } from "../define.js";

// EDHREC rank 5383.
const COMBAT_TEXT = "At the beginning of combat on your turn, exile up to one target card from a graveyard.";
const ADAPT_TEXT = "{1}{B}: Adapt 2.";
const COUNTERS_TEXT =
  "Whenever one or more +1/+1 counters are put on this creature, put a creature card exiled with this creature onto the battlefield under your control with a finality counter on it. It gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Emperor of Bones",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Noble"],
  power: 2,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${ADAPT_TEXT}\n${COUNTERS_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "adapt", amount: 2 },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        withCounters: { kind: "finality", amount: 1 },
        leftover: "stay",
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: { step: "end" },
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice the creature Emperor of Bones put onto the battlefield.",
            },
          ],
        },
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
