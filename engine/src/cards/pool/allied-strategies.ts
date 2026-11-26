import { defineCard } from "../define.js";

// Domain counted from the target player's side: the basic land types among
// lands they control as it resolves (`{ basicLandTypes: { target: 0 } }`).

export default defineCard({
  name: "Allied Strategies",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Domain — Target player draws a card for each basic land type among lands they control.",
  targets: ["player"],
  effect: { kind: "draw", amount: { basicLandTypes: { target: 0 } }, target: 0 },
});
