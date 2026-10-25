import { defineCard } from "../define.js";

// EDHREC rank 8050.
//
// Rulings:
//   [2015-08-25] You can't sacrifice the same permanent to pay two different costs. Notably, if
//     you sacrifice an Eldrazi Scion to activate the last ability of Drowner of Hope, you won't
//     add {C}.
//   [2015-08-25] You can sacrifice any Eldrazi Scion to activate Drowner of Hope's last ability,
//     not just one created by Drowner of Hope.
// Devoid is its empty colours. An "Eldrazi Scion" has both creature types.

const ETB_TEXT =
  'When this creature enters, create two 1/1 colorless Eldrazi Scion creature tokens. They have "Sacrifice this token: Add {C}."';
const TAP_TEXT = "Sacrifice an Eldrazi Scion: Tap target creature.";

export default defineCard({
  name: "Drowner of Hope",
  manaCost: "{5}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 5,
  text: `Devoid (This card has no color.)\n${ETB_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Eldrazi", subtypes: ["Scion"] } } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
