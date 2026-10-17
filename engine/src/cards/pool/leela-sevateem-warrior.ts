import { defineCard } from "../define.js";

// Xyris, the Writhing Storm's trigger, with a counter on Leela instead.
const DRAW_TEXT =
  "Whenever an opponent draws a card except the first one they draw in each of their draw steps, put a +1/+1 counter on Leela.";

export default defineCard({
  name: "Leela, Sevateem Warrior",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `${DRAW_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent", exceptFirstInDrawStep: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
