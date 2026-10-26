import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 9978. Gruul Charm's mode: every permanent you
// own, tokens you created included (the ruling), comes back under your
// control indefinitely.

export default defineCard({
  name: "Brand",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Gain control of all permanents you own. (This effect lasts indefinitely.)\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [],
  effect: { kind: "gain-control-all", filter: { ownedBy: "you" }, untilEndOfTurn: false },
});
