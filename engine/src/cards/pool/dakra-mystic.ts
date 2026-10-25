import { defineCard } from "../define.js";

const TEXT =
  "{U}, {T}: Each player reveals the top card of their library. You may put the revealed cards into their owners' graveyards. If you don't, each player draws a card.";

// The revealed card is still each library's top card, so "put the revealed
// cards into their owners' graveyards" moves each player's top card; if you
// don't, each player draws that same card (the ruling). The choice is made
// once every card is revealed.
export default defineCard({
  name: "Dakra Mystic",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-player",
        then: {
          kind: "may",
          prompt: "Put the revealed cards into their owners' graveyards? (If you don't, each player draws a card.)",
          effect: { kind: "mill", target: "each-player", amount: 1 },
          else: { kind: "draw", amount: 1, who: "each-player" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
