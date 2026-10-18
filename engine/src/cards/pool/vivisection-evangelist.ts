import { defineCard } from "../define.js";

// EDHREC rank 21870.

const ENTERS_TEXT =
  "Corrupted — When this creature enters, if an opponent has three or more poison counters, destroy target creature or planeswalker an opponent controls.";

export default defineCard({
  name: "Vivisection Evangelist",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
