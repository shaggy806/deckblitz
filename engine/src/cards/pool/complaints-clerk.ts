import { defineCard } from "../define.js";

// "Whenever you roll a 1": a die whose result (rule 706.2) is 1 — a roll to
// visit included (701.52a: it's a six-sided die roll).

const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";
const ROLL = "Whenever you roll a 1, create a 1/1 white Clown Robot artifact creature token.";

export default defineCard({
  name: "Complaints Clerk",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sloth", "Beast", "Employee"],
  power: 3,
  toughness: 3,
  text: `${OPEN}\n${ROLL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
    {
      trigger: { on: "event", event: "rolls-die", who: "you", die: { atLeast: 1, atMost: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Clown Robot Token", count: 1 },
      resolve: null,
      text: ROLL,
    },
  ],
});
