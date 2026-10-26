import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 29128.

export default defineCard({
  name: "Spike Hatcher",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 0,
  toughness: 0,
  text: "This creature enters with six +1/+1 counters on it.\n{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.\n{1}, Remove a +1/+1 counter from this creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from this creature: Put a +1/+1 counter on target creature.",
    },
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 6 } },
      text: "This creature enters with six +1/+1 counters on it.",
    },
  ],
});
