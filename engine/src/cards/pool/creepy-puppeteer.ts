import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, if you attacked with exactly one other creature this combat, you may have that creature's base power and toughness become 4/3 until end of turn.";

export default defineCard({
  name: "Creepy Puppeteer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      // "Attacked" is past tense: what was declared, whatever has happened to
      // the two of them since.
      trigger: { on: "attack-with", who: "you", exactly: 2, includingThis: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Make the other attacker's base power and toughness 4/3 until end of turn?",
        effect: {
          kind: "for-each-permanent",
          filter: { triggerBatch: true, isSource: false },
          effect: { kind: "animate", target: 0, power: 4, toughness: 3, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
