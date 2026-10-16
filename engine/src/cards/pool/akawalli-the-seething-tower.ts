import { defineCard } from "../define.js";

// EDHREC rank 11048. The Lost Caverns of Ixalan.
//
// Descend N — "N or more permanent cards in your graveyard" — is a
// `cards-in-graveyard` condition over cards that aren't instants or sorceries
// (The Ancient One's shape). Two statics: the second adds its +2/+2 on top of
// the first's ("an additional +2/+2") and Challenger Troll's "can't be
// blocked by more than one creature".

const DESCEND_4 =
  "Descend 4 — As long as there are four or more permanent cards in your graveyard, Akawalli gets +2/+2 and has trample.";
const DESCEND_8 =
  "Descend 8 — As long as there are eight or more permanent cards in your graveyard, Akawalli gets an additional +2/+2 and can't be blocked by more than one creature.";

export default defineCard({
  name: "Akawalli, the Seething Tower",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 3,
  toughness: 3,
  text: `${DESCEND_4}\n${DESCEND_8}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { notTypes: ["instant", "sorcery"] } },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: DESCEND_4,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 8, filter: { notTypes: ["instant", "sorcery"] } },
      grantPt: [2, 2],
      blockedByAtMostOne: true,
      text: DESCEND_8,
    },
  ],
});
