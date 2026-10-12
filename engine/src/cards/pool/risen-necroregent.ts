import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 16966.
const END_TEXT = "At the beginning of your end step, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Risen Necroregent",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat", "Knight"],
  power: 5,
  toughness: 4,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\nMax speed — ${END_TEXT}`,
  static: [
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: { kind: "create-token", token: "Zombie Token", count: 1 },
          resolve: null,
          text: END_TEXT,
        },
      ],
      text: `Max speed — ${END_TEXT}`,
    }),
  ],
});
