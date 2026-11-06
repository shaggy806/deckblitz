import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Terrasymbiosis's "do this only once each turn":
// the trigger still fires each time, and only one draw a turn is taken.

const TEXT =
  "Whenever you put one or more +1/+1 counters on Chekov and McCoy, you may draw that many cards. Do this only once each turn.";

export default defineCard({
  name: "Chekov and McCoy",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot", "Doctor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1", byYou: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw that many cards?",
        effect: { kind: "draw", amount: { triggerValue: true } },
        oncePerTurn: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
