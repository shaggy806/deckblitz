import { defineCard } from "../define.js";
import { mentor } from "../helpers.js";

// EDHREC rank 16801. Guilds of Ravnica.

const DIES_TEXT = "When this creature dies, put a +1/+1 counter on each white creature you control.";

export default defineCard({
  name: "Light of the Legion",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n${DIES_TEXT}`,
  triggered: [
    mentor(),
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", colors: ["W"], controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
