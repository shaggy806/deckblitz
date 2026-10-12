import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8190.
//
// Rulings:
//   [2025-09-19] If a creature has {X} in its mana cost, X is 0 when determining its mana value.

// Hero's Blade's "you may attach this Equipment to it", on Faramir's mana
// value filter.
const ATTACH_TEXT =
  "Whenever a creature you control with mana value 5 or greater enters, you may attach this Equipment to it.";
const STATIC_TEXT = "Equipped creature gets +4/+4.";

export default defineCard({
  name: "Doc Ock's Tentacles",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACH_TEXT}\n${STATIC_TEXT}\nEquip {5}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", manaValue: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Doc Ock's Tentacles to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 4], text: STATIC_TEXT }],
  activated: [equip("{5}")],
});
