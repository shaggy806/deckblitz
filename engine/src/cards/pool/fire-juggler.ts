import { defineCard } from "../define.js";

// EDHREC rank 28663.
const TEXT =
  "Whenever this creature becomes blocked, clash with an opponent. If you win, this creature deals 4 damage to each creature blocking it. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)";

export default defineCard({
  name: "Fire Juggler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "clash",
        won: {
          kind: "damage-all",
          amount: 4,
          filter: { type: "creature", blockingRelation: { relation: "blocking" } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
