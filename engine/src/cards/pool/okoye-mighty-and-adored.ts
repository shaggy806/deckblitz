import { defineCard } from "../define.js";

const ETB_TEXT = "When Okoye enters, you become the monarch.";
const WATCH_TEXT =
  "Whenever that creature attacks the monarch this turn, it gains double strike and trample until end of turn.";
const COMBAT_TEXT = `At the beginning of combat on your turn, put a +1/+1 counter on target creature. ${WATCH_TEXT}`;

export default defineCard({
  name: "Okoye, Mighty and Adored",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "attacks", who: "self", attackedMonarch: true }, watching: 0 },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: "trigger-object", keyword: "double-strike", duration: "end-of-turn" },
                { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
              ],
            },
            text: WATCH_TEXT,
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
