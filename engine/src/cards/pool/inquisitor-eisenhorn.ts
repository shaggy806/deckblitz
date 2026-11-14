import { defineCard } from "../define.js";

// EDHREC rank 13609.
//
// - "You may reveal the first card you draw each turn as you draw it" is God-
//   Eternal Kefnet's `revealsDrawn`: asked on any turn (the ruling), kept
//   hidden or not an instant or sorcery, nothing happens. The token is made
//   though the card has left your hand since (the ruling).
// - "Investigate that many times": Piper Wright's.

const REVEAL_TEXT =
  "You may reveal the first card you draw each turn as you draw it. Whenever you reveal an instant or sorcery card this way, create Cherubael, a legendary 4/4 black Demon creature token with flying.";
const COMBAT_TEXT = "Whenever Inquisitor Eisenhorn deals combat damage to a player, investigate that many times.";

export default defineCard({
  name: "Inquisitor Eisenhorn",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Inquisitor"],
  power: 2,
  toughness: 3,
  text: `${REVEAL_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 1 },
      revealsDrawn: { filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Cherubael Token", count: 1 },
      resolve: null,
      text: REVEAL_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", investigate: true, count: { triggerValue: true } },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
