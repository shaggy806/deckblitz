import { defineCard } from "../define.js";

// EDHREC rank 31666.
// "Damage dealt to you this turn" is the `damage-taken` turn stat — damage,
// not life lost, so prevented damage doesn't count (the ruling). "If it's an
// opponent's turn" is "not your turn": every other player is an opponent.

export default defineCard({
  name: "Discordant Spirit",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "At the beginning of each end step, if it's an opponent's turn, put a +1/+1 counter on this creature for each 1 damage dealt to you this turn.\nAt the beginning of your end step, remove all +1/+1 counters from this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { turnStat: "damage-taken", who: "you" },
      },
      resolve: null,
      text: "At the beginning of each end step, if it's an opponent's turn, put a +1/+1 counter on this creature for each 1 damage dealt to you this turn.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "remove-counter",
        target: "source",
        counter: "+1/+1",
        amount: { countersOn: "source", counter: "+1/+1" },
      },
      resolve: null,
      text: "At the beginning of your end step, remove all +1/+1 counters from this creature.",
    },
  ],
});
