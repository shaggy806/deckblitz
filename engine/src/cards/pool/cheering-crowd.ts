import { defineCard } from "../define.js";

// Braids, Conjurer Adept's "each player's … that player may": the active
// player is asked, and what they do is their effect — so the counter is
// theirs to put and the {C} goes into their mana pool, one for each counter
// of any kind on the Crowd once theirs is on. Declined, nothing happens.
const TEXT =
  "At the beginning of each player's first main phase, that player may put a +1/+1 counter on this creature. If they do, they add {C} for each counter on it.";

export default defineCard({
  name: "Cheering Crowd",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "any" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Put a +1/+1 counter on Cheering Crowd and add {C} for each counter on it?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "add-mana", mana: "C", amount: { countersOn: "source" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
