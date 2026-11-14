import { defineCard } from "../define.js";

// EDHREC rank 10279.
//
// Detain (rule 701.35a) done to each matching permanent at once, nobody
// choosing — not targeted, so protection or hexproof doesn't stop it. A
// creature already attacking or blocking stays in combat (the ruling).
const ENTERS_TEXT =
  "When Lavinia enters, detain each nonland permanent your opponents control with mana value 4 or less.";

export default defineCard({
  name: "Lavinia of the Tenth",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: `Protection from red\n${ENTERS_TEXT} (Until your next turn, those permanents can't attack or block and their activated abilities can't be activated.)`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { notTypes: ["land"], controlledBy: "opponent", manaValue: { op: "lte", n: 4 } },
        effect: { kind: "detain", target: 0 },
        simultaneous: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
