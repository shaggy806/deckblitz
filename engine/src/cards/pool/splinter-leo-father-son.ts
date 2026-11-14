import { defineCard } from "../define.js";

// The modes and their targets are chosen as the trigger goes on the stack
// (`announced`), each mode a different player. "Each other creature": every
// creature that player controls but Splinter & Leo.
const TRIGGER_TEXT = "When Splinter & Leo enter, choose one or both. Each mode must target a different player.";
const TOKEN_MODE = "Target player creates a 2/2 red Mutant creature token.";
const COUNTERS_MODE = "Put a +1/+1 counter on each other creature target player controls.";

export default defineCard({
  name: "Splinter & Leo, Father & Son",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Rat", "Turtle"],
  power: 2,
  toughness: 2,
  text: `${TRIGGER_TEXT}\n• ${TOKEN_MODE}\n• ${COUNTERS_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        eachTargetsDifferentPlayer: true,
        minModes: 1,
        maxModes: 2,
        modes: [
          {
            text: TOKEN_MODE,
            targets: ["player"],
            effect: { kind: "create-token", token: "Mutant Token", count: 1, who: "target-controller" },
          },
          {
            text: COUNTERS_MODE,
            targets: ["player"],
            effect: {
              kind: "add-counter-all",
              filter: { type: "creature", controlledBy: "you" },
              counter: "+1/+1",
              amount: 1,
              controlledByTarget: 0,
              exceptSource: true,
            },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${TOKEN_MODE} ${COUNTERS_MODE}`,
    },
  ],
});
