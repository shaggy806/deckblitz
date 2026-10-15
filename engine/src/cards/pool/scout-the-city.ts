import { defineCard } from "../define.js";

const LOOK =
  "• Look Around — Mill three cards. You may put a permanent card from among them into your hand. You gain 3 life. (To mill three cards, put the top three cards of your library into your graveyard.)";
const BRING = "• Bring Down — Destroy target creature with flying.";

export default defineCard({
  name: "Scout the City",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n${LOOK}\n${BRING}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        // Something Worth Saving's mill-and-keep, three cards and 3 life.
        text: LOOK,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: 3 },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: 1,
              destination: "hand",
              leftover: "stay",
              filter: {
                thisWay: "milled",
                typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
              },
            },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
      {
        text: BRING,
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
