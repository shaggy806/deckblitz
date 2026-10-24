import { defineCard } from "../define.js";

// EDHREC rank 7478.
//
// Each sentence chooses its own opponent as the spell resolves — the same one
// or a different one, and neither is a target (the rulings).
const DRAW_TEXT = "Choose an opponent. You and that player each draw three cards.";
const UNTAP_TEXT =
  "Choose an opponent. Untap all nonland permanents you control and all nonland permanents that player controls.";
const NONLAND_YOU_CONTROL = { notTypes: ["land"], controlledBy: "you" } as const;

export default defineCard({
  name: "Intellectual Offering",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${DRAW_TEXT}\n${UNTAP_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 3 },
            { kind: "draw", amount: 3, who: "that-player" },
          ],
        },
      },
      {
        kind: "choose-opponent",
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "untap-all", filter: NONLAND_YOU_CONTROL },
            { kind: "untap-all", filter: NONLAND_YOU_CONTROL, who: "that-player" },
          ],
        },
      },
    ],
  },
});
