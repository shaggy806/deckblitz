import { defineCard } from "../define.js";

// Mystery Booster Commander. "Any other target": any target but Arzakon.
const PLUS = "+2: Arzakon deals 3 damage to any other target.";
const MINUS_THREE =
  "−3: Create a Black Lotus token. (It's a {0} artifact with \"{T}, Sacrifice this token: Add three mana of any one color.\")";
const MINUS_SEVEN = "−7: Each player shuffles their hand and graveyard into their library, then draws seven cards.";

export default defineCard({
  name: "Arzakon",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Arzakon"],
  loyalty: 4,
  canBeCommander: true,
  text: `${PLUS}\n${MINUS_THREE}\n${MINUS_SEVEN}\nArzakon can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "other", of: "any-target" }],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Black Lotus Token", count: 1 },
      resolve: null,
      text: MINUS_THREE,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
          { kind: "draw", amount: 7, who: "each-player" },
        ],
      },
      resolve: null,
      text: MINUS_SEVEN,
    },
  ],
});
