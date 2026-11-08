import { defineCard } from "../define.js";

// Transforms into Temple of Civilization.
const TOKENS_TEXT =
  "If one or more creature tokens would be created under your control, three times that many of those tokens are created instead.";
const DIES_TEXT = "When Ojer Taq dies, return it to the battlefield tapped and transformed under its owner's control.";

export default defineCard({
  name: "Ojer Taq, Deepest Foundation",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TOKENS_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", instead: { modify: { times: 3 } }, ofTokens: { type: "creature" } },
      text: TOKENS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, transformed: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Ojer Taq, Deepest Foundation", "Temple of Civilization"],
  transform: true,
});
