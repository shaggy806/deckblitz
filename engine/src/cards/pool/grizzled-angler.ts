import { defineCard } from "../define.js";

const MILL_TEXT =
  "{T}: Mill two cards. Then if there is a colorless creature card in your graveyard, transform this creature.";

// It transforms only as the ability resolves, never just for having a
// colorless creature card in the graveyard (the ruling).
export default defineCard({
  name: "Grizzled Angler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: `${MILL_TEXT} (To mill two cards, put the top two cards of your library into your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature", colorless: true } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  faces: ["Grizzled Angler", "Grisly Anglerfish"],
  transform: true,
});
