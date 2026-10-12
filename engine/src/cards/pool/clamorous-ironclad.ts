import { defineCard } from "../define.js";

export default defineCard({
  name: "Clamorous Ironclad",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 3,
  keywords: ["menace"],
  cycling: { cost: "{R}" },
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)\nCycling {R} ({R}, Discard this card: Draw a card.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 3",
    },
  ],
});
