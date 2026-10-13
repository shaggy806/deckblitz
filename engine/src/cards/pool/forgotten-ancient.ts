import { defineCard } from "../define.js";

// EDHREC rank 390.
//
// Rulings:
//   [2022-12-08] Forgotten Ancient's first ability will resolve before the spell that caused it to
//     trigger. Putting a +1/+1 counter on Forgotten Ancient is optional.
//   [2022-12-08] Forgotten Ancient's last ability doesn't target any creatures. You choose how
//     many +1/+1 counters will be moved (and onto which creatures) as the ability resolves.
//     Notably, once the ability starts resolving and you make these choices, no player may take
//     actions until the ability has finished resolving.

export default defineCard({
  name: "Forgotten Ancient",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 3,
  text: "Whenever a player casts a spell, you may put a +1/+1 counter on this creature.\nAt the beginning of your upkeep, you may move any number of +1/+1 counters from this creature onto other creatures.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Forgotten Ancient?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever a player casts a spell, you may put a +1/+1 counter on this creature.",
    },
    {
      // Not targeted (the ruling): as it resolves, one creature at a time
      // and how many onto it, until none more is chosen — "you may", so
      // none at all is an answer.
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "move-counters",
        from: "source",
        to: { choose: { type: "creature" }, prompt: "Choose a creature to move +1/+1 counters onto (none to stop)" },
        counter: "+1/+1",
        amount: "any",
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may move any number of +1/+1 counters from this creature onto other creatures.",
    },
  ],
});
