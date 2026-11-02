import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const ACTIVATE_TEXT = "{6}: Gandalf's owner shuffles him into their library and draws three cards.";

export default defineCard({
  name: "Gandalf, Wandering Wizard",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 4,
  toughness: 5,
  triggered: [ward({ mana: "{3}" })],
  text: `Ward {3} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {3}.)\n${ACTIVATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-into-library", target: "source" },
          { kind: "as-player", who: "source-owner", effect: { kind: "draw", amount: 3 } },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
