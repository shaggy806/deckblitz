import { defineCard } from "../define.js";

export default defineCard({
  name: "Eureka",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Starting with you, each player may put a permanent card from their hand onto the battlefield. Repeat this process until no one puts a card onto the battlefield.",
  effect: {
    kind: "repeat",
    again: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
    effect: {
      kind: "each-player-may",
      who: "each-player",
      startingWithYou: true,
      prompt: "Put a permanent card from your hand onto the battlefield?",
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 1,
        max: 1,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
        destination: "battlefield",
        leftover: "stay",
      },
    },
  },
});
