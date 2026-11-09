import { defineCard } from "../define.js";

// EDHREC rank 15513.
const TEXT =
  "Whenever you cast a creature spell with mana value equal to Jackal's power, copy that spell, except the copy isn't legendary. Then put a +1/+1 counter on Jackal. (The copy becomes a token.)";

export default defineCard({
  name: "Jackal, Genius Geneticist",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: { powerOf: "source" } } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "copy-spell", target: "trigger-spell", except: { removeSupertypes: ["legendary"] } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
