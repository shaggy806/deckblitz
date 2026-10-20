import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// "For each opponent, … up to one target … that player controls" is one
// optional slot per seat (Haytham Kenway), exiled together and returned the
// moment this leaves (rule 610.3 — `untilSourceLeaves`). Recruit is The
// Mountain King's Return's: draw, discard, and a Human Soldier if the
// discarded card was nonland.
const EXILE_TEXT =
  "When this enchantment enters, for each opponent, exile up to one target nonland permanent that player controls until this enchantment leaves the battlefield.";
const RECRUIT_TEXT = "When this enchantment enters, recruit.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Celebrate the Mountain-king",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${RECRUIT_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "exile", target: 1, untilSourceLeaves: true },
          { kind: "exile", target: 2, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: RECRUIT_TEXT,
    },
  ],
});
