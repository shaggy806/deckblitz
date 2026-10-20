import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";

// EDHREC rank 9096.
//
// Rulings:
//   [2021-11-19] If a player controls fewer than the chosen number of creatures, they will
//     sacrifice all their creatures.
//   [2021-11-19] Starting with the player whose turn it is, each player in turn order chooses
//     which creatures they will sacrifice, then all the creatures chosen by all players are
//     sacrificed at the same time. Players get to know the choices made by players who chose
//     before them.
//   [2021-11-19] The numbers you may choose include 0 and 13.
//
// The number is chosen as the spell resolves — one mode per number, as
// Expel the Interlopers does. Each mode is an each-player edict, which the
// engine asks in APNAP order and then sacrifices all at once; a count of 0
// sacrifices nothing.

const MODES: ModeOption[] = Array.from({ length: 14 }, (_, n) => ({
  text: `Choose ${n}. Each player sacrifices ${n} creature${n === 1 ? "" : "s"}.`,
  effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: n },
}));

export default defineCard({
  name: "By Invitation Only",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose a number between 0 and 13. Each player sacrifices that many creatures of their choice.",
  effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
});
