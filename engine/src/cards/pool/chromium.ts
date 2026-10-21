import { defineCard } from "../define.js";

// Legends. EDHREC rank 24395.
//
// Rampage 2 (rule 702.23) in its inline shape (Aerathi Berserker's).

const RAMPAGE =
  "Rampage 2 (Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it beyond the first.)";
const UPKEEP = "At the beginning of your upkeep, sacrifice Chromium unless you pay {W}{U}{B}.";
const BEYOND_FIRST = { product: [2, { difference: [{ blockersOf: "source" }, 1] }] } as const;

export default defineCard({
  name: "Chromium",
  manaCost: "{2}{W}{W}{U}{U}{B}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${RAMPAGE}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: BEYOND_FIRST,
        toughness: BEYOND_FIRST,
        duration: "end-of-turn",
      },
      resolve: null,
      text: RAMPAGE,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{W}{U}{B}", text: "Pay {W}{U}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
