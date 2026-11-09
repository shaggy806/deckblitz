import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES } from "../helpers.js";

// "Gain": in addition to what they have, so nothing's lost (rule 305.7 is for a
// land that "becomes" a type), and each type's mana ability comes with it (305.6).

const FIRST = "Lands you control gain all basic land types until end of turn.";
const SECOND = "Draw a card.";

export default defineCard({
  name: "Energybending",
  manaCost: "{2}",
  colors: [],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: `${FIRST}\n${SECOND}`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { type: "land", controlledBy: "you" },
        simultaneous: true,
        effect: { kind: "become", target: 0, addSubtypes: [...BASIC_LAND_TYPE_CHOICES], duration: "end-of-turn" },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
