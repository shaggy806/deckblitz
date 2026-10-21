import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, create a 2/2 green Ooze creature token.";
const END_TEXT = "At the beginning of your end step, put a +1/+1 counter on each Ooze you control.";
const MAKE_TEXT = "{1}{G}{G}{G}: Create a 2/2 green Ooze creature token.";

export default defineCard({
  name: "Biogenic Ooze",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${END_TEXT}\n${MAKE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ooze Token", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Ooze Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Ooze", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
