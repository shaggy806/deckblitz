import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 18981. The last ability always targets an
// opponent and may target a creature; with every target illegal it does
// nothing at all (the ruling — rule 608.2b).
const ENTER_TEXT =
  "When this enchantment enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const SAC_TEXT =
  "{2}{W}{U}{B}{R}{G}, Sacrifice this enchantment: You gain 2 life and draw two cards. Target opponent loses 2 life. This enchantment deals 2 damage to up to one target creature. You create a 2/2 green Bear creature token.";

export default defineCard({
  name: "Path to the World Tree",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}{U}{B}{R}{G}", tap: false, sacrifice: "self" },
      targets: ["opponent", { kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "damage", amount: 2, target: 1 },
          { kind: "create-token", token: "Bear Token", count: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
