import { defineCard } from "../define.js";

// EDHREC rank 24314.
//
// Any spell of yours with a creature on the battlefield among its targets —
// any creature, Hawkeye included, the spell free to target other things too
// (Graduation Day's `targets` clause, without its instant-or-sorcery limit).
const CAST_TEXT =
  "Whenever you cast a spell that targets a creature, put a +1/+1 counter on Hawkeye. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Hawkeye, Bowslinger",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { permanent: { type: "creature" } } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
