import { defineCard } from "../define.js";

// EDHREC rank 19505. Modern Horizons 3.
//
// I is Fulminous Forte's damage. II is Abandon Attachments' "you may discard
// a card. If you do" (a yes with an empty hand discards nothing, so nothing
// is exiled) and Painter's Studio's impulse to the end of your next turn —
// cast and played under the normal costs and timing (the ruling). III's
// token is a copy of the card Spellgorger Weird (the ruling): its name, its
// {2}{R} mana cost, its ability.
//
// Rulings:
//   [2024-06-07] Ral and the Implicit Maze's last ability creates a token that's a copy of the
//     card Spellgorger Weird in the Oracle card reference.
//   [2024-06-07] You pay all costs and follow all normal timing rules for cards played with Ral
//     and the Implicit Maze's second chapter ability. For example, if one of the exiled cards is a
//     land card, you may play it only during your main phase while the stack is empty.

const I_TEXT = "I — This Saga deals 2 damage to each creature and planeswalker your opponents control.";
const II_TEXT =
  "II — You may discard a card. If you do, exile the top two cards of your library. You may play them until the end of your next turn.";
const III_TEXT =
  'III — Create a Spellgorger Weird token. (It\'s a {2}{R} 2/2 Weird creature with "Whenever you cast a noncreature spell, put a +1/+1 counter on Spellgorger Weird.")';

export default defineCard({
  name: "Ral and the Implicit Maze",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "damage-all",
        amount: 2,
        filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "opponent" },
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to exile the top two cards of your library (playable until the end of your next turn)?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "Spellgorger Weird Token", count: 1 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
