import { defineCard } from "../define.js";

// EDHREC rank 24806.
//
// Exalted (rule 702.83) granted to each other Hero, Merchant of Truth's
// shape: each Hero carries its own instance, so each triggers separately
// when a creature you control attacks alone — Zarda herself has none.
const EXALTED_TEXT =
  "Other Heroes you control have exalted. (Whenever a creature you control attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents you control.)";

export default defineCard({
  name: "Zarda, the Power Princess",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${EXALTED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Hero", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [
        {
          trigger: { on: "attacks-alone", who: "you-control" },
          targets: [],
          effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
        },
      ],
      text: EXALTED_TEXT,
    },
  ],
});
