import { defineCard } from "../define.js";

// Rivals of Ixalan (RIX). The reveal is chosen as the trigger resolves (its
// rulings), one Dinosaur card at most, kept in hand: Armored Kincaller's
// `look-and-choose`, whose `then` runs only when a card was revealed.
const UPKEEP = "At the beginning of your upkeep, you may reveal a Dinosaur card from your hand. If you do, you gain 2 life.";
const SEARCH =
  "{3}{W}{W}, Sacrifice this creature: Search your library for a Dinosaur card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Priest of the Wakening Sun",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP}\n${SEARCH}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { subtype: "Dinosaur" },
        destination: "reveal",
        leftover: "stay",
        then: { kind: "gain-life", amount: 2 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "search-library", filter: { subtype: "Dinosaur" }, destination: "hand", min: 0, max: 1, reveal: true },
      resolve: null,
      text: SEARCH,
    },
  ],
});
