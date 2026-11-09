import { defineCard } from "../define.js";

// EDHREC rank 758.
//
// A rule about casting (101.2), judged where the card is as the cast begins
// (601.2a): a commander from the command zone, flashback or escape from a
// graveyard, a foretold, adventuring or impulse-exiled card from exile and a
// card on a library's top are all barred, whatever permission offers them.
// Lands aren't cast: playing one from anywhere still works.
const LOCK_TEXT = "Your opponents can't cast spells from anywhere other than their hands.";

export default defineCard({
  name: "Drannith Magistrate",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: LOCK_TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "opponents", notFrom: ["hand"] }],
      text: LOCK_TEXT,
    },
  ],
});
