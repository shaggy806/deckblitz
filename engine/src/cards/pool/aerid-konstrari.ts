import { defineCard } from "../define.js";

// EDHREC rank 14305.
//
// Rulings:
//   [2026-08-21] Heartwood tokens are a kind of predefined token. Each one is a red and green
//     artifact with the artifact subtype Heartwood and the ability "{T}: Add {R} or {G}."
//
// "Then … +X/+0": X is counted after the new Heartwood is made, so it counts.

const ENTERS_DIES_TEXT =
  "When Aerid Konstrari enters or dies, create a Heartwood token. (It's a red and green artifact with \"{T}: Add {R} or {G}.\")";
const PUMP_TEXT =
  "{6}: Create a Heartwood token. Then Aerid Konstrari gets +X/+0 until end of turn, where X is the number of artifacts you control.";

export default defineCard({
  name: "Aerid Konstrari",
  manaCost: "{1}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Sphinx"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_DIES_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Heartwood Token", count: 1 },
      resolve: null,
      text: ENTERS_DIES_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Heartwood Token", count: 1 },
      resolve: null,
      text: ENTERS_DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Heartwood Token", count: 1 },
          {
            kind: "modify-pt",
            target: "source",
            power: { countOf: { type: "artifact", controlledBy: "you" } },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
