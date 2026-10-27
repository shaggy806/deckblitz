import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 32145.

export default defineCard({
  name: "Basalt Gargoyle",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nEcho {2}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n{R}: This creature gets +0/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +0/+1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{R}", text: "Pay {2}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {2}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
  ],
});
