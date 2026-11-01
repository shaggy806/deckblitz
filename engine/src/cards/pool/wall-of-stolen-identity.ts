import { defineCard } from "../define.js";

const WHEN_YOU_DO =
  "When you do, tap the copied creature and it doesn't untap during its controller's untap step for as long as you " +
  "control this creature.";

// Players can respond to the "when you do" (its ruling), and it leaving first
// taps the creature with no lasting effect (the duration's already over).
export default defineCard({
  name: "Wall of Stolen Identity",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Wall"],
  power: 0,
  toughness: 0,
  text: `You may have this creature enter as a copy of any creature on the battlefield, except it's a Wall in addition to its other types and has defender. ${WHEN_YOU_DO}`,
  copyOnEnter: {
    filter: { type: "creature" },
    except: { addSubtypes: ["Wall"], keywords: ["defender"] },
    whenYouDo: {
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "trigger-object" },
          { kind: "restrict", target: "trigger-object", restrictions: ["doesnt-untap"], duration: "while-you-control-source" },
        ],
      },
      text: WHEN_YOU_DO,
    },
  },
});
