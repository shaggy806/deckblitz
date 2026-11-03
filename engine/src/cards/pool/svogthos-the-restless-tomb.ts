import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

const ANIMATE =
  '{3}{B}{G}: Until end of turn, this land becomes a black and green Plant Zombie creature with "This creature\'s power and toughness are each equal to the number of creature cards in your graveyard." It\'s still a land.';

export default defineCard({
  name: "Svogthos, the Restless Tomb",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{3}{B}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            addTypes: ["creature"],
            addSubtypes: ["Plant", "Zombie"],
            setColors: ["B", "G"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: {
                countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
                plusPower: 0,
                plusToughness: 0,
              },
              text: "This creature's power and toughness are each equal to the number of creature cards in your graveyard.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
