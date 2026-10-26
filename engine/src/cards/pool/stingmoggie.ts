import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 28443.

export default defineCard({
  name: "Stingmoggie",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: "This creature enters with two +1/+1 counters on it.\n{3}{R}, Remove a +1/+1 counter from this creature: Destroy target artifact or land.",
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{3}{R}, Remove a +1/+1 counter from this creature: Destroy target artifact or land.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
});
