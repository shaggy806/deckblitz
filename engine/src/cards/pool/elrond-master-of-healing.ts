import { defineCard } from "../define.js";

const SCRY_TEXT =
  "Whenever you scry, put a +1/+1 counter on each of up to X target creatures, where X is the number of cards looked at while scrying this way.";
const TARGET_TEXT =
  "Whenever a creature you control with a +1/+1 counter on it becomes the target of a spell or ability an opponent controls, you may draw a card.";

// A `scries` trigger's value is the cards actually looked at (the first
// ruling), and bounds the group as the trigger goes on the stack.
export default defineCard({
  name: "Elrond, Master of Healing",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 4,
  text: `${SCRY_TEXT}\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        byOpponentOnly: true,
      },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
