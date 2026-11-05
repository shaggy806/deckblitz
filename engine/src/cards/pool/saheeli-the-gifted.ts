import { defineCard } from "../define.js";

const SERVO_TEXT = "+1: Create a 1/1 colorless Servo artifact creature token.";
const AFFINITY_TEXT =
  "+1: The next spell you cast this turn has affinity for artifacts. (It costs {1} less to cast for each artifact you control as you cast it.)";
const ULT_TEXT =
  "−7: For each artifact you control, create a token that's a copy of it. Those tokens gain haste. Exile those tokens at the beginning of the next end step.";

export default defineCard({
  name: "Saheeli, the Gifted",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Saheeli"],
  loyalty: 4,
  canBeCommander: true,
  text: `${SERVO_TEXT}\n${AFFINITY_TEXT}\n${ULT_TEXT}\nSaheeli, the Gifted can be your commander.`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: SERVO_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, affinityFor: { type: "artifact", controlledBy: "you" } },
      resolve: null,
      text: AFFINITY_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: { each: { type: "artifact", controlledBy: "you" } },
        count: 1,
        who: "you",
        gains: { keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
