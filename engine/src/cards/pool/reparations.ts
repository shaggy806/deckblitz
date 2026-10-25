import { defineCard } from "../define.js";

// EDHREC rank 22772. Hindering Light's "targets you or a creature you
// control", on an opponent's cast trigger (Feather's spell-targets filter).

const TEXT = "Whenever an opponent casts a spell that targets you or a creature you control, you may draw a card.";

export default defineCard({
  name: "Reparations",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: {
          anyOf: [
            { targets: { player: "you" } },
            { targets: { permanent: { type: "creature", controlledBy: "you" } } },
          ],
        },
      },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
