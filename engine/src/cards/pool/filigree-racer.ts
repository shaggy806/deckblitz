import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 15404.
//
// Rulings:
//   [2024-06-07] If an effect allows you to pay an alternative cost rather than a spell's mana
//     cost, you may pay that alternative cost when you jump-start a spell. You'll still discard a
//     card as an additional cost to cast it.
//   [2024-06-07] When casting a spell with jump-start, you must still follow any timing
//     restrictions and permissions, including those based on the card's type. For instance, you
//     can cast a sorcery using jump-start only when you could normally cast a sorcery.
//   [2024-06-07] A spell cast using jump-start will always be exiled afterward, whether it
//     resolves, it's countered, or it leaves the stack in some other way.
//
// The jump-start is a `grant-graveyard-keyword` (rule 702.133a), the card cast
// from the graveyard for its mana cost with a card discarded, then exiled.
const ENERGY_TEXT = "When this Vehicle enters, you get {E}{E}{E}{E} (four energy counters).";
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, you may pay {E}{E}. When you do, target instant or sorcery card in your graveyard gains jump-start until end of turn.";

export default defineCard({
  name: "Filigree Racer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: `${ENERGY_TEXT}\n${ATTACK_TEXT} (You may cast that card from your graveyard by discarding a card in addition to paying its other costs. Then exile it.)\n${crewText(1)}`,
  activated: [crew(1, crewText(1))],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 4 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to give an instant or sorcery card in your graveyard jump-start?",
        costEnergy: 2,
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
          effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "jump-start" } },
          text: "When you do, target instant or sorcery card in your graveyard gains jump-start until end of turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
