import { defineCard } from "../define.js";

// EDHREC rank 19588. Charmbreaker Devils' random pick, made as it resolves
// (the ruling), with rebound.

export default defineCard({
  name: "Surreal Memoir",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  rebound: true,
  text: "Return an instant card at random from your graveyard to your hand.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    filter: { type: "instant" },
    then: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
});
