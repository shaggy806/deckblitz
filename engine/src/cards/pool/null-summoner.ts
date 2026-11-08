import { defineCard } from "../define.js";

export default defineCard({
  name: "Null Summoner",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 2,
  text: "When this creature enters, if you cast it, target opponent reveals their hand. You choose a nonland card from it. Exile that card.\nThreshold — As long as there are seven or more cards in your graveyard, you may cast the exiled card, and mana of any type can be spent to cast that spell.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      resolve: null,
      text: "When this creature enters, if you cast it, target opponent reveals their hand. You choose a nonland card from it. Exile that card.",
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      text: "Threshold — As long as there are seven or more cards in your graveyard, you may cast the exiled card, and mana of any type can be spent to cast that spell.",
      mayPlay: { from: "exile", filter: {}, linked: true, spendAs: "any-type" },
    },
  ],
});
