import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "Pay 8 life: Each creature you control gains indestructible until end of turn. Then, draw a card for each creature you control.";

export default defineCard({
  name: "Avacyn and Griselbrand",
  manaCost: "{4}{W}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Demon"],
  power: 8,
  toughness: 8,
  keywords: ["flying", "vigilance", "lifelink"],
  text: `Flying, vigilance, lifelink\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 8 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "indestructible",
            duration: "end-of-turn",
          },
          { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
