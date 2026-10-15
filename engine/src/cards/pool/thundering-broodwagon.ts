import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 23406.

const ETB_TEXT =
  "When this Vehicle enters, destroy target nonland permanent an opponent controls with mana value 4 or less.";

export default defineCard({
  name: "Thundering Broodwagon",
  manaCost: "{2}{B}{B}{G}{G}",
  colors: ["B", "G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 5,
  keywords: ["reach", "menace"],
  cycling: { cost: "{2}" },
  text: `Reach, menace\n${ETB_TEXT}\nCrew 3\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  activated: [crew(3)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { notTypes: ["land"], manaValue: { op: "lte", n: 4 } } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
