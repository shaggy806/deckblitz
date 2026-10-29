import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15039.
// Makes Junk → use "Junk Token".

export default defineCard({
  name: "Duchess, Wayward Tavernkeep",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 4,
  toughness: 3,
  text: "Hunters for Hire — Whenever a creature you control deals combat damage to a player, put a quest counter on it.\n{1}, Remove a quest counter from a permanent you control: Create a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "quest", count: 1, from: {} } },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: "{1}, Remove a quest counter from a permanent you control: Create a Junk token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "quest", amount: 1 },
      resolve: null,
      text: "Hunters for Hire — Whenever a creature you control deals combat damage to a player, put a quest counter on it.",
    },
  ],
});
