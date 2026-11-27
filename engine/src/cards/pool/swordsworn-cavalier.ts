import { defineCard } from "../define.js";

// March of the Machine. EDHREC rank 28138.
//
// Bristlebane Outrider's `turn-history` of entries, narrowed to Knights.
// `excludeSelf` leaves out this object in its current stint only, so a
// Cavalier that entered, left and came back this turn sees its earlier self
// as another Knight (its ruling); the Knight need not still be there, a
// Knight, or yours (the other ruling).

const TEXT = "This creature has first strike as long as another Knight entered the battlefield under your control this turn.";

export default defineCard({
  name: "Swordsworn Cavalier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["first-strike"],
      condition: { kind: "turn-history", what: "entered", filter: { subtype: "Knight" }, excludeSelf: true },
      text: TEXT,
    },
  ],
});
