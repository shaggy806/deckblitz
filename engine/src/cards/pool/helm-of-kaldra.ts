import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// EDHREC rank 12565. Fifth Dawn.
//
// The three Equipment are checked as the ability resolves (the ruling): with
// all three, Kaldra is made and each of them you control is attached to it
// (rule 701.3b — one that can't equip it stays where it is). Each is
// legendary, so you control at most one of each.

const STATIC_TEXT = "Equipped creature has first strike, trample, and haste.";
const KALDRA_TEXT =
  "{1}: If you control Equipment named Helm of Kaldra, Sword of Kaldra, and Shield of Kaldra, create Kaldra, a legendary 4/4 colorless Avatar creature token. Attach those Equipment to it.";
const NAMES = ["Helm of Kaldra", "Sword of Kaldra", "Shield of Kaldra"] as const;

const named = (name: string): CardFilter => ({ subtype: "Equipment", name });

export default defineCard({
  name: "Helm of Kaldra",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${KALDRA_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike", "trample", "haste"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: NAMES.map((name) => ({ kind: "controls", filter: named(name), atLeast: 1 }) as const),
        },
        then: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Kaldra", count: 1 },
            {
              kind: "attach",
              target: "created",
              attachments: { subtype: "Equipment", controlledBy: "you", anyOf: NAMES.map((name) => ({ name })) },
            },
          ],
        },
      },
      resolve: null,
      text: KALDRA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
