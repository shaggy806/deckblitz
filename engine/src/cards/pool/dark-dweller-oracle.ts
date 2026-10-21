import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark-Dweller Oracle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{1}, Sacrifice a creature: Exile the top card of your library. You may play that card this turn. (You still pay its costs. You can play a land this way only if you have an available land play remaining.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Sacrifice a creature: Exile the top card of your library. You may play that card this turn.",
    },
  ],
});
