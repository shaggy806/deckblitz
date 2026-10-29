import { defineCard } from "../define.js";

const FACES = ["Cease // Desist", "Cease", "Desist"];
const CEASE_TEXT =
  "Exile up to two target cards from a single graveyard. Target player gains 2 life and draws a card.";

export default defineCard({
  name: "Cease",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: CEASE_TEXT,
  // The group is the last slot, so the player comes first (target.ts).
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2, sameController: true },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 1, simultaneous: true, effect: { kind: "exile", target: 1 } },
      { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
      { kind: "draw", amount: 1, target: 0 },
    ],
  },
  faces: FACES,
  split: true,
});
