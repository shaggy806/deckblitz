import { defineCard } from "../define.js";

// Rulings: an indestructible target isn't destroyed, but the rest happens; with
// no creature card, the whole library is revealed, then shuffled.
export default defineCard({
  name: "Polymorph",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Destroy target creature. It can't be regenerated. Its controller reveals cards from the top of their library until they reveal a creature card. The player puts that card onto the battlefield, then shuffles all other cards revealed this way into their library.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      {
        kind: "reveal-until",
        whose: { controllerOfTarget: 0 },
        filter: { type: "creature" },
        put: "battlefield",
        rest: "shuffle",
      },
    ],
  },
});
