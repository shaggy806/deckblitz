import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// "Whenever you attack with three or more creatures" fires once per attack
// declaration; what happens to the attackers afterwards doesn't matter (the
// ruling).

const ATTACK_TEXT = "Whenever you attack with three or more creatures, investigate.";

export default defineCard({
  name: "Meddling Youths",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 4,
  toughness: 5,
  keywords: ["haste"],
  text: "Haste\nWhenever you attack with three or more creatures, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
