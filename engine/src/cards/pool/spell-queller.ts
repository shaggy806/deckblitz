import { defineCard } from "../define.js";

// EDHREC rank 10448.
//
// - The enters trigger exiles the spell linked to this (rule 607.2a, Smirking
//   Spelljacker's), an uncounterable one included (the ruling); an {X} spell's
//   mana value counts its X on the stack.
// - The leaves trigger has that card's owner cast it as the trigger resolves
//   or not at all, free (Severance Priest's `owners-of-exiled-with-source`).
//   Left before the enters trigger resolves, the leaves trigger finds nothing
//   and the spell stays exiled for good (the ruling).

const EXILE_TEXT = "When this creature enters, exile target spell with mana value 4 or less.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, the exiled card's owner may cast that card without paying its mana cost.";

export default defineCard({
  name: "Spell Queller",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${EXILE_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 4 } } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "owners-of-exiled-with-source",
        effect: { kind: "cast-now", from: "exiled-with-source", by: "that-player", free: true },
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
