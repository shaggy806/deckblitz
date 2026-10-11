import { defineCard } from "../define.js";

// EDHREC rank 6852.
//
// Rulings:
//   [2023-06-16] Eagles of the North's triggered ability affects only creatures you control at the
//     time it resolves. Any creatures that come under your control later in the turn won't be
//     affected.
//   [2023-06-16] Typecycling is a form of cycling. Any ability that triggers on a card being
//     cycled also triggers on a card being typecycled.
const ETB_TEXT = "When this creature enters, creatures you control get +1/+0 and gain first strike until end of turn.";

export default defineCard({
  name: "Eagles of the North",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text:
    `Flying\n${ETB_TEXT}\n` +
    "Plainscycling {1} ({1}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "first-strike",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  cycling: { cost: "{1}", search: { subtype: "Plains" } },
});
