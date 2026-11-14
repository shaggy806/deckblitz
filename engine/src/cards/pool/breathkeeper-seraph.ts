import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

// EDHREC rank 8492.

const GRANTED =
  "When this creature dies, you may return it to the battlefield under its owner's control at the beginning of your next upkeep.";
const PAIRED = `As long as Breathkeeper Seraph is paired with another creature, each of those creatures has "${GRANTED}"`;

export default defineCard({
  name: "Breathkeeper Seraph",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  text: `Flying, soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\n${PAIRED}`,
  keywords: ["flying"],
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          // A delayed ability (rule 603.7) whose "you" is this trigger's
          // controller: the card is returned only if it's still the same
          // object in the graveyard then (rule 400.7), and the choice is made
          // as it would be returned.
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "you" },
            effect: {
              kind: "may",
              prompt: "Return it to the battlefield?",
              effect: { kind: "put-onto-battlefield", target: "trigger-object" },
            },
            text: "You may return it to the battlefield under its owner's control.",
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: PAIRED,
    },
  ],
});
