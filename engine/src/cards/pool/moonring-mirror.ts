import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever you draw a card, exile the top card of your library face down.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may exile all cards from your hand face down. If you do, put all other cards you own exiled with this artifact into your hand.";

// "All cards" of an empty hand can be done, so a player with none may still
// choose to and gets the others.

export default defineCard({
  name: "Moonring Mirror",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "exile-from-library", amount: 1, linked: true, faceDown: true },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile your hand face down, and put the other cards you own exiled with Moonring Mirror into your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile-graveyard", target: "you", fromHand: "only", faceDown: true, linked: true },
            { kind: "return-exiled-by-source", linked: "hand", others: true, filter: { ownedBy: "you" } },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
