import { defineCard } from "../define.js";
import { mentor } from "../helpers.js";

const COUNTERS_TEXT =
  "Whenever one or more +1/+1 counters are put on a creature you control, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "The Powerful Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n${COUNTERS_TEXT}`,
  triggered: [
    mentor(),
    {
      trigger: { on: "counters-put", who: "you-control", counter: "+1/+1", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
