import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, ward } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this creature attacks while saddled, search your library for a nonland permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Guardian Sunmare",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Horse", "Mount"],
  power: 5,
  toughness: 5,
  text: `Ward {2}\n${ATTACK_TEXT}\nSaddle 4`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
          notTypes: ["land"],
          manaValue: { op: "lte", n: 3 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(4)],
});
