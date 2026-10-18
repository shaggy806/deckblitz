import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 15556.
//
// Backup grants only what's printed below it — menace, not swampcycling,
// which is printed above it (and works only from the hand anyway).

export default defineCard({
  name: "Gloomfang Mauler",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: "Swampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)\nBackup 2 (When this creature enters, put two +1/+1 counters on target creature. If that's another creature, it gains the following ability until end of turn.)\nMenace",
  triggered: [backup(2, { keywords: ["menace"] })],
});
