import { defineCard } from "../define.js";

const UNTAP_TEXT = "{T}: Untap target land.";
const THRESHOLD_TEXT =
  "Threshold — {T}: Untap up to three target lands. Activate only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Krosan Restorer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: `${UNTAP_TEXT}\n${THRESHOLD_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "threshold" },
      targets: [
        { kind: "optional", of: "land" },
        { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
          { kind: "untap", target: 2 },
        ],
      },
      resolve: null,
      text: THRESHOLD_TEXT,
    },
  ],
});
