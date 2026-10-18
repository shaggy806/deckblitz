import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 9996.

const ENTER_TEXT =
  "When this Siege enters, return target nonbattle permanent card from your graveyard to the battlefield.";

export default defineCard({
  name: "Invasion of Tolvada",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker"],
            notTypes: ["battle"],
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Tolvada", "The Broken Sky"],
  transform: true,
});
