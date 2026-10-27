import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31712.

export default defineCard({
  name: "Tectonic Fiend",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: "Echo {4}{R}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nThis creature attacks each combat if able.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{4}{R}{R}", text: "Pay {4}{R}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {4}{R}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
});
