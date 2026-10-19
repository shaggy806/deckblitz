import { defineCard } from "../define.js";

// EDHREC rank 9117.
//
// One printed trigger, two halves: this creature itself (a token copy of it
// too — "this creature" isn't "nontoken"), and another nontoken artifact you
// control, each going to a graveyard or exile from the battlefield (Syr
// Vondam's `leaves-battlefield` with `to`).
const HARBINGER_TEXT =
  "Harbinger of Despair — Whenever this creature or another nontoken artifact you control is put into a graveyard from the battlefield or is put into exile from the battlefield, target opponent loses 1 life and you gain 1 life.";

const drain = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 1, target: 0 },
    { kind: "gain-life", amount: 1 },
  ],
} as const;

export default defineCard({
  name: "Psychomancer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${HARBINGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard", "exile"] },
      targets: ["opponent"],
      effect: drain,
      resolve: null,
      text: HARBINGER_TEXT,
    },
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "artifact", token: false },
        otherOnly: true,
        to: ["graveyard", "exile"],
      },
      targets: ["opponent"],
      effect: drain,
      resolve: null,
      text: HARBINGER_TEXT,
    },
  ],
});
