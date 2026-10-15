import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 24485.

const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on Blue Marvel.";

export default defineCard({
  name: "Blue Marvel, Adam Brashear",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${DRAW_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
