import { defineCard } from "../define.js";

// EDHREC rank 20347.
//
// Rulings:
//   You pay all costs and follow all timing rules for cards played this way. For example, if the
//     exiled card is a land card, you may play it only during your main phase while the stack is
//     empty.
//
// Delirium is checked as the spell resolves, while it's still on the stack (so
// it doesn't count itself); the impulse draw is Clockwork Percussionist's.
const DAMAGE_TEXT = "Impossible Inferno deals 6 damage to target creature.";
const DELIRIUM_TEXT =
  "Delirium — If there are four or more card types among cards in your graveyard, exile the top card of your library. You may play it until the end of your next turn.";

export default defineCard({
  name: "Impossible Inferno",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${DAMAGE_TEXT}\n${DELIRIUM_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "delirium" },
        then: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      },
    ],
  },
});
