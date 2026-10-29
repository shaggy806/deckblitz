import { defineCard } from "../define.js";

// Exodus. Counted from the chosen opponent's side: 0/0 with nobody chosen,
// so it dies as it enters if that player's hand is empty.

const CHOOSE = "As this creature enters, choose an opponent.";
const PT = "Entropic Specter's power and toughness are each equal to the number of cards in the chosen player's hand.";
const DISCARD = "Whenever this creature deals damage to a player, that player discards a card.";

export default defineCard({
  name: "Entropic Specter",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter", "Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE}\n${PT}\n${DISCARD}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, forChosenPlayer: true },
      text: PT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
