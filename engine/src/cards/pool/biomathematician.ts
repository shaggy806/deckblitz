import { defineCard } from "../define.js";

// EDHREC rank 19275. Oracle's Gift's shape at one: the new Fractal is one of
// "each Fractal you control", so it survives as a 1/1.
const ETB_TEXT =
  "When this creature enters, create a 0/0 green and blue Fractal creature token. Put a +1/+1 counter on each Fractal you control.";

export default defineCard({
  name: "Biomathematician",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Fractal Token", count: 1 },
          {
            kind: "add-counter-all",
            filter: { subtype: "Fractal", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
