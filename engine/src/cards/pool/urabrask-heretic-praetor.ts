import { defineCard } from "../define.js";

// EDHREC rank 4494. A one-use replacement on the upkeep's opponent ("they"),
// fixed as it resolves; the card exiled is theirs and so is the permission.
const UP_TEXT = "At the beginning of your upkeep, exile the top card of your library. You may play it this turn.";
const OPP_TEXT =
  "At the beginning of each opponent's upkeep, the next time they would draw a card this turn, instead they exile the top card of their library. They may play it this turn.";

export default defineCard({
  name: "Urabrask, Heretic Praetor",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${UP_TEXT}\n${OPP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: UP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        players: "active-player",
        replacement: {
          event: "would-draw",
          who: "any-player",
          instead: {
            effect: { kind: "impulse-exile", amount: 1, whose: "active-player", duration: "end-of-turn", play: true, byOwner: true },
            text: "Instead they exile the top card of their library. They may play it this turn.",
          },
        },
      },
      resolve: null,
      text: OPP_TEXT,
    },
  ],
});
