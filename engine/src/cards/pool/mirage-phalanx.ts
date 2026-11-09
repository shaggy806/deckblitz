import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

const GRANTED =
  "At the beginning of combat on your turn, create a token that's a copy of this creature, except it has haste and loses soulbond. Exile it at end of combat.";
const PAIRED = `As long as Mirage Phalanx is paired with another creature, each of those creatures has "${GRANTED}"`;

export default defineCard({
  name: "Mirage Phalanx",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: `Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\n${PAIRED}`,
  triggered: [...soulbond()],
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "begin-combat", who: "you" },
          targets: [],
          effect: {
            kind: "create-token-copy",
            of: "source",
            count: 1,
            exileAtEndOfCombat: true,
            exceptions: { keywords: ["haste"], loseKeywordAbilities: ["soulbond"] },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: PAIRED,
    },
  ],
});
