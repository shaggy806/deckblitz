import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 5719. Kelp is a Clue itself, and isn't one of the others.
const COMBAT_TEXT =
  "At the beginning of each combat, other Clues you control become 6/6 Plant creatures in addition to their other types until end of turn.";
const DRAW_TEXT = "{2}, Sacrifice this creature: Draw a card.";

export default defineCard({
  name: "Tangletrove Kelp",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Clue", "Plant"],
  power: 6,
  toughness: 6,
  text: `Ward {2}\n${COMBAT_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { subtype: "Clue", controlledBy: "you" },
        exceptSource: true,
        power: 6,
        toughness: 6,
        addTypes: ["creature"],
        addSubtypes: ["Plant"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
