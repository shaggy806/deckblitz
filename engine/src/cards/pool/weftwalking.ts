import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this enchantment enters, if you cast it, shuffle your hand and graveyard into your library, then draw seven cards.";
const FREE_TEXT = "The first spell each player casts during each of their turns may be cast without paying its mana cost.";

export default defineCard({
  name: "Weftwalking",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${FREE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "you", zones: ["hand", "graveyard"] },
          { kind: "draw", amount: 7 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        anyPlayer: true,
        when: { firstEachTurn: true, yourTurnOnly: true },
      },
      text: FREE_TEXT,
    },
  ],
});
