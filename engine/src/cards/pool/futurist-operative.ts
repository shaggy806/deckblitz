import { defineCard } from "../define.js";

// EDHREC rank 18902.
//
// Rulings:
//   [2022-02-18] Effects that set a creature's power, toughness, or creature types will be applied
//     in timestamp order. The timestamp of Futurist Operative's first ability is when it entered
//     the battlefield, not when it became tapped.
//   [2022-02-18] Untapping Futurist Operative once it's been declared as an attacker won't remove
//     it from combat.
//
// Goddric, Cloaked Reveler's shape: a conditional static on itself that
// replaces its creature types (layer 4) and sets its base P/T (layer 7b), in
// the permanent's own timestamp order; "can't be blocked" rides along.
const STATIC_TEXT =
  "As long as this creature is tapped, it's a Human Citizen with base power and toughness 1/1 and can't be blocked.";
const UNTAP_TEXT = "{2}{U}: Untap this creature.";

export default defineCard({
  name: "Futurist Operative",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 4,
  text: `${STATIC_TEXT}\n${UNTAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: true } },
      setSubtypes: ["Human", "Citizen"],
      setBasePt: { power: 1, toughness: 1 },
      grantKeywords: ["unblockable"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
