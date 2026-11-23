import { defineCard } from "../define.js";

// Playtest card. "Ulamog's Power-Plant": a Power-Plant but not an Urza's one,
// so the Tron lands don't count it. The enters trigger is Mind Raker's
// "you may put a card an opponent owns from exile into that player's
// graveyard"; "otherwise" covers both declining and finding nothing to put.

const ETB =
  "When Processing Plant enters the battlefield, you may put a card an opponent owns from exile into that player's graveyard. If you do, untap Processing Plant. Otherwise, exile the top card of each opponent's library.";
const MANA = "{T}: Add {W}, {U}, {B}, or {C}.";
const EXILE_TOP = { kind: "exile-from-library", whose: "each-opponent", amount: 1 } as const;

export default defineCard({
  name: "Processing Plant",
  colors: [],
  types: ["land"],
  subtypes: ["Ulamog's", "Power-Plant"],
  text: `Processing Plant enters the battlefield tapped.\n${ETB}\n${MANA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Processing Plant enters the battlefield tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a card an opponent owns from exile into their graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 1,
              max: 1,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen" },
              then: { kind: "untap", target: "source" },
              else: EXILE_TOP,
            },
          ],
        },
        else: EXILE_TOP,
      },
      resolve: null,
      text: ETB,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "C"] }, amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
});
