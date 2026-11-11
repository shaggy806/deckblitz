import { defineCard } from "../define.js";

// EDHREC rank 6504. Adventures in the Forgotten Realms (AFR).
//
// The draw never happens (rule 614.6): nothing is drawn, and with an empty
// library nothing is exiled and nobody loses for drawing from it (the
// ruling, rule 614.11). The cards are exiled face down with no permission to
// look (rule 406.3), linked to this Asmodeus (607.2a): one that left and came
// back is a new object with no cards of its own (the ruling).
const CONTRACT = "Binding Contract — If you would draw a card, exile the top card of your library face down instead.";
const DRAW = "{B}{B}{B}: Draw seven cards.";
const RETURN = "{B}: Return all cards exiled with Asmodeus to their owner's hand and you lose that much life.";

export default defineCard({
  name: "Asmodeus the Archfiend",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Devil", "God"],
  power: 6,
  toughness: 6,
  text: `${CONTRACT}\n${DRAW}\n${RETURN}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: { effect: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true } },
      },
      text: CONTRACT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 7 },
      resolve: null,
      text: DRAW,
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-exiled-by-source", linked: "hand" },
          // "That much": the number of cards returned.
          { kind: "lose-life", amount: { thisWay: "returned-to-hand" } },
        ],
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
