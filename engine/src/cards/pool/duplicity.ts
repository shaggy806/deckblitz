import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this enchantment enters, exile the top five cards of your library face down.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may exile all cards from your hand face down. If you do, put all other cards you own exiled with this enchantment into your hand.";
const END_TEXT = "At the beginning of your end step, discard a card.";
const LOSE_TEXT =
  "When you lose control of this enchantment, put all cards exiled with this enchantment into their owner's graveyard.";

export default defineCard({
  name: "Duplicity",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}\n${END_TEXT}\n${LOSE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", amount: 5, faceDown: true, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile your hand face down, and put the other cards you own exiled with Duplicity into your hand?",
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
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "discard", target: "you", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
    {
      trigger: { on: "loses-control", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "graveyard" },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
