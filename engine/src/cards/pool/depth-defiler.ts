import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";

// EDHREC rank 19278.
//
// "Choose one. If it was kicked, choose both instead": a modal cast trigger
// whose mode count is fixed by the kicker, written as two cast triggers of
// which exactly one triggers — one mode unkicked, both kicked (a mode with
// no legal target can't be chosen, rule 700.2b). Neither condition is an
// intervening "if" of the card's own: the ability resolves as normal, both
// modes if kicked, even if the spell is countered in response (the ruling).
// So the kicked one's resolution check also holds once the spell has left
// the stack (that move clears its `kicked` flag), and the unkicked one's
// can't change. Devoid: colorless.
const CAST_TEXT = "When you cast this spell, choose one. If it was kicked, choose both instead.";
const MODES: readonly ModeOption[] = [
  {
    text: "Return target creature to its owner's hand.",
    targets: ["creature"],
    effect: { kind: "return-to-hand", target: 0 },
  },
  {
    text: "Target player draws two cards, then discards a card.",
    targets: ["player"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 2, target: 0 },
        { kind: "discard", target: 0, amount: 1 },
      ],
    },
  },
];

export default defineCard({
  name: "Depth Defiler",
  manaCost: "{3}{U}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 5,
  text:
    "Devoid (This card has no color.)\nKicker {C} (You may pay an additional {C} as you cast this spell.)\n" +
    `${CAST_TEXT}\n• Return target creature to its owner's hand.\n• Target player draws two cards, then discards a card.`,
  kicker: { cost: "{C}" },
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "not", of: { kind: "self-kicked" } },
      targets: [],
      effect: { kind: "modal", announced: true, minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "this-cast" },
      condition: {
        kind: "any",
        of: [{ kind: "self-kicked" }, { kind: "not", of: { kind: "source-zone", zones: ["stack"], sameObject: true } }],
      },
      targets: [],
      effect: { kind: "modal", announced: true, minModes: 2, maxModes: 2, modes: MODES },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
