import { defineCard } from "../define.js";

// EDHREC rank 4768.
//
// Rulings:
//   [2025-06-06] You don't choose a target for Prishe's Wanderings at the time you cast it.
//     Rather, a second "reflexive" ability triggers when you search your library this way. You
//     choose a target for that ability as it goes on the stack.
//
// You always search, finding a card or not, so the reflexive ability always triggers.

const REFLEXIVE_TEXT = "When you search your library this way, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Prishe's Wanderings",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Search your library for a basic land card or Town card, put it onto the battlefield tapped, then shuffle. ${REFLEXIVE_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Town" }] },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      {
        kind: "reflexive-trigger",
        targets: ["creature-you-control"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        text: REFLEXIVE_TEXT,
      },
    ],
  },
});
