import { defineCard } from "../define.js";

const BLACK_OR_RED = { anyOf: [{ colors: ["B" as const] }, { colors: ["R" as const] }] };

// The replacement asks the colour as the object is in the zone it's leaving
// (the ruling: a Clone copying a red creature is exiled) — `moveObject` asks
// it before the move. Dying alongside a black or red permanent still exiles
// it (the leave batch).
export default defineCard({
  name: "Sanctifier en-Vec",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Protection from black and from red\nWhen this creature enters, exile all cards that are black or red from all graveyards.\nIf a black or red permanent, spell, or card not on the battlefield would be put into a graveyard, exile it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-player", filter: BLACK_OR_RED },
      resolve: null,
      text: "When this creature enters, exile all cards that are black or red from all graveyards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B", "R"] },
      text: "Protection from black and from red",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: BLACK_OR_RED },
      text: "If a black or red permanent, spell, or card not on the battlefield would be put into a graveyard, exile it instead.",
    },
  ],
});
