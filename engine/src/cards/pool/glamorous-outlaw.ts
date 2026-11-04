import { defineCard } from "../define.js";
import { landUntilCastFromExile } from "../helpers.js";

const ENTERS_TEXT = "When this creature enters, it deals 2 damage to each opponent and you scry 2.";
const EXILE = landUntilCastFromExile(["U", "B", "R"]);

export default defineCard({
  name: "Glamorous Outlaw",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 4,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${EXILE.text}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", who: "each-opponent", amount: 2 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [EXILE],
});
