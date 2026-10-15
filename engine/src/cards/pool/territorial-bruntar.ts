import { defineCard } from "../define.js";

// EDHREC rank 17501.
//
// Rulings:
//   [2025-07-25] You pay all costs and follow all timing rules for cards cast with the permission
//     granted by Territorial Bruntar’s landfall ability. For example, if the exiled card is a
//     sorcery card, you may cast it only during your main phase while the stack is empty.
//
// Codie, Vociferous Codex's find-and-permit shape, paid for: every card
// exiled stays exiled, and the nonland one may be cast this turn.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, exile cards from the top of your library until you exile a nonland card. You may cast that card this turn.";

export default defineCard({
  name: "Territorial Bruntar",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["reach"],
  text: `Reach\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        then: { kind: "allow-cast-from-exile", target: 0 },
        rest: "stay",
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
