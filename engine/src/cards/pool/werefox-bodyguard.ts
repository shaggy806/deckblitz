import { defineCard } from "../define.js";

// EDHREC rank 6886.
//
// Rulings:
//   [2023-09-01] If Werefox Bodyguard leaves the battlefield before its triggered ability
//     resolves, the target creature won't be exiled.
//   [2023-09-01] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2023-09-01] Auras attached to the exiled creature will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled creature will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//
// Banishing Light's O-Ring, on up to one other non-Fox creature.

const ENTER_TEXT =
  "When this creature enters, exile up to one other target non-Fox creature until this creature leaves the battlefield.";
const LIFE_TEXT = "{1}{W}, Sacrifice this creature: You gain 2 life.";

export default defineCard({
  name: "Werefox Bodyguard",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Fox", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { type: "creature", notSubtypes: ["Fox"] } } },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The other half of the O-Ring (rule 610.3a — Banishing Light's shape).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
