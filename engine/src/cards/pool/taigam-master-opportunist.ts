import { defineCard } from "../define.js";

// The copy first, then the spell itself off the stack into exile with four
// time counters and suspend — so the copy resolves and the original is cast
// later, free. A spell already gone (countered in response) isn't exiled.
const FLURRY_TEXT =
  "Flurry — Whenever you cast your second spell each turn, copy it, then exile the spell you cast with four time counters on it. If it doesn't have suspend, it gains suspend.";

export default defineCard({
  name: "Taigam, Master Opportunist",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  text: `${FLURRY_TEXT} (At the beginning of its owner's upkeep, they remove a time counter. When the last is removed, they may play it without paying its mana cost. If it's a creature, it has haste.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "copy-spell", target: "trigger-spell" },
          { kind: "give-suspend", target: "trigger-object", timeCounters: 4 },
        ],
      },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
