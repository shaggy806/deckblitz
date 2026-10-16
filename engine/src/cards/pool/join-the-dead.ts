import { defineCard } from "../define.js";

// EDHREC rank 12925. The Lost Caverns of Ixalan.
//
// "Instead if" is read as it resolves: a `conditional` over the descend 4
// count, -10/-10 in place of -5/-5 (never both).

export default defineCard({
  name: "Join the Dead",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -5/-5 until end of turn.\nDescend 4 — That creature gets -10/-10 until end of turn instead if there are four or more permanent cards in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { notTypes: ["instant", "sorcery"] } },
    then: { kind: "modify-pt", target: 0, power: -10, toughness: -10, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
  },
});
