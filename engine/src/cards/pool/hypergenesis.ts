import { defineCard } from "../define.js";

export default defineCard({
  name: "Hypergenesis",
  colors: ["G"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{1}{G}{G}" },
  text: "Suspend 3—{1}{G}{G}\nStarting with you, each player may put an artifact, creature, enchantment, or land card from their hand onto the battlefield. Repeat this process until no one puts a card onto the battlefield.",
  // One card at a time, each entering before the next player is asked (its
  // ruling: the permanents enter sequentially), until a whole round passes.
  effect: {
    kind: "repeat",
    again: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
    effect: {
      kind: "each-player-may",
      who: "each-player",
      startingWithYou: true,
      prompt: "Put an artifact, creature, enchantment, or land card from your hand onto the battlefield?",
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 1,
        max: 1,
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
        destination: "battlefield",
        leftover: "stay",
      },
    },
  },
});
