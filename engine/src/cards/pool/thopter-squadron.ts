import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16356.
// Makes Thopter → use "Thopter Token".

export default defineCard({
  name: "Thopter Squadron",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with three +1/+1 counters on it.\n{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Thopter artifact creature token with flying. Activate only as a sorcery.\n{1}, Sacrifice another Thopter: Put a +1/+1 counter on this creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Thopter artifact creature token with flying. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Thopter" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice another Thopter: Put a +1/+1 counter on this creature. Activate only as a sorcery.",
      otherOnly: true,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
