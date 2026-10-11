import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const DWARF_TEXT =
  "Whenever Balin or another Dwarf you control enters, you may discard your hand. Draw X cards, where X is the number of cards discarded this way. If you have an enduring story, Balin deals X damage to each opponent.";

// Declining discards nothing: X is 0, so nothing is drawn or dealt either.
export default defineCard({
  name: "Balin, Loremaster",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 4,
  toughness: 4,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${DWARF_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Dwarf" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand to draw that many cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { thisWay: "discarded" } },
            {
              kind: "conditional",
              condition: { kind: "enduring-story" },
              then: { kind: "damage", amount: { thisWay: "discarded" }, who: "each-opponent" },
            },
          ],
        },
      },
      resolve: null,
      text: DWARF_TEXT,
    },
  ],
});
