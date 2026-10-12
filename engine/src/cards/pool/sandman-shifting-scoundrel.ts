import { defineCard } from "../define.js";

// EDHREC rank 9156.
//
// Rulings:
//   [2025-09-19] Sandman's second ability applies only at the time blockers are declared. For
//     example, if Sandman is blocked by a creature with 4 power, and then an effect gives that
//     creature -3/-0, it won't stop blocking Sandman.
//   [2025-09-19] Sandman's first ability works in all zones, not only the battlefield.

// Ashaya's lands CDA (counted in every zone); Arlinn's Wolf's evasion. The
// graveyard ability is Slimefoot and Squee's: it doesn't move the card as a
// cost (`staysInZone`), and its effect returns it and the land as one
// instruction (`simultaneous`), both tapped. A land target gone by
// resolution counters the ability, and Sandman stays put.
const PT_TEXT = "Sandman's power and toughness are each equal to the number of lands you control.";
const EVASION_TEXT = "Sandman can't be blocked by creatures with power 2 or less.";
const RETURN_TEXT = "{3}{G}{G}: Return this card and target land card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Sandman, Shifting Scoundrel",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sand", "Elemental", "Villain"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${EVASION_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: EVASION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "put-onto-battlefield", target: "source", enterTapped: true },
          { kind: "put-onto-battlefield", target: 0, enterTapped: true },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
