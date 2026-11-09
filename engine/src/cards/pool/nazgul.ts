import { defineCard } from "../define.js";

const TEMPT_TEXT = "Whenever the Ring tempts you, put a +1/+1 counter on each Wraith you control.";

export default defineCard({
  name: "Nazgûl",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wraith", "Knight"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  deckCopies: 9,
  text: `Deathtouch\nWhen this creature enters, the Ring tempts you.\n${TEMPT_TEXT}\nA deck can have up to nine cards named Nazgûl.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this creature enters, the Ring tempts you.",
    },
    {
      trigger: { on: "ring-tempts", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Wraith", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: TEMPT_TEXT,
    },
  ],
});
