import { defineCard } from "../define.js";

const FLASH_TEXT =
  "The next sorcery spell you cast this turn can be cast as though it had flash. (It can be cast any time you could cast an instant.)";

// The rulings: no card is chosen as it resolves — it's a rule until the turn
// ends or a sorcery spell is cast, even one cast when a sorcery could have
// been anyway. Several Quickens all apply to, and end on, that one sorcery.
// Until then a sorcery with suspend can be suspended any time an instant
// could be cast (rule 702.62a's "if you could begin to cast this card").
export default defineCard({
  name: "Quicken",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${FLASH_TEXT}\nDraw a card.`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: { filter: { type: "sorcery" }, next: true },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
