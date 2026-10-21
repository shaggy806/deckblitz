import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "{4}: This land becomes a 3/3 Citizen creature with vigilance until end of turn. It's still a land. This ability costs {1} less to activate for each legendary creature and planeswalker you control.";

export default defineCard({
  name: "Mobilized District",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Citizen"],
        keywords: ["vigilance"],
        duration: "end-of-turn",
      },
      resolve: null,
      // One per permanent: a legendary planeswalker that's also a creature
      // reduces it by only {1} (the ruling).
      costReduction: {
        reduceGeneric: {
          countOf: { supertype: "legendary", typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" },
        },
      },
      text: ANIMATE_TEXT,
    },
  ],
});
