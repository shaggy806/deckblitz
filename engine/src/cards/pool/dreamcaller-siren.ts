import { defineCard } from "../define.js";

// EDHREC rank 20281. "If you control another Pirate" is an intervening-if:
// checked as it would trigger and again as it resolves (the ruling).

const ENTER_TEXT = "When this creature enters, if you control another Pirate, tap up to two target nonland permanents.";

export default defineCard({
  name: "Dreamcaller Siren",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\nThis creature can block only creatures with flying.\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Pirate" }, atLeast: 1, excludeSelf: true },
      targets: [
        { kind: "optional", of: "nonland-permanent" },
        { kind: "optional", of: { kind: "other", of: "nonland-permanent", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
