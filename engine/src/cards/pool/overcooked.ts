import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect). The celebration is read as the trigger resolves: a Food, or
// instead a Food Fight card onto the battlefield.
const NO_GAIN_TEXT = "Players can't gain life.";
const CELEBRATION_TEXT =
  "Celebration — At the beginning of your end step, create a Food token. If two or more nonland permanents entered the battlefield under your control this turn, instead conjure a card named Food Fight onto the battlefield.";

export default defineCard({
  name: "Overcooked",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: [],
  text: `${NO_GAIN_TEXT}\n${CELEBRATION_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: NO_GAIN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-history", what: "entered", filter: { notTypes: ["land"] }, atLeast: 2 },
        then: { kind: "conjure", name: "Food Fight", to: "battlefield" },
        else: { kind: "create-token", token: "Food Token", count: 1 },
      },
      resolve: null,
      text: CELEBRATION_TEXT,
    },
  ],
});
