import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Rulings:
//   The last ability affects only creatures your opponents control as it
//   resolves; creatures they begin to control afterward, before your next
//   turn begins, don't get -3/-0 (`modify-pt-all` marks the ones it finds).

const ENTER_TEXT = "When this creature enters, creatures your opponents control get -3/-0 until your next turn.";

export default defineCard({
  name: "Mouth of the Storm",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${ENTER_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -3,
        toughness: 0,
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
