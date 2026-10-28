import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings (2021-04-16): either face or half may be named, not both; spells
// with the name already on the stack are unaffected; mode two's target that
// later becomes a creature still can't attack or block (detain).

const MODE_1 = "Choose a nonland card name. Opponents can't cast spells with the chosen name until your next turn.";
const MODE_2 =
  "Choose target nonland permanent. Until your next turn, it can't attack or block, and its activated abilities can't be activated.";

export default defineCard({
  name: "Academic Probation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: `Choose one —\n• ${MODE_1}\n• ${MODE_2}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE_1,
        targets: [],
        effect: {
          kind: "choose-card-name",
          filter: { notTypes: ["land"] },
          then: {
            kind: "player-effect",
            duration: "until-your-next-turn",
            cantCast: { who: "each-opponent", filter: { hasName: CHOSEN_CARD_NAME }, label: "spells with the chosen name" },
          },
        },
      },
      // Detain's exact wording (rule 701.35a), mana abilities included.
      { text: MODE_2, targets: ["nonland-permanent"], effect: { kind: "detain", target: 0 } },
    ],
  },
});
