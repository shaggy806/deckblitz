import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, reveal the top card of your library. Any opponent may have you put that card into your graveyard. If a player does, this creature deals damage to that player equal to that card's mana value. Otherwise, put that card into your hand.";

// "Any opponent may …": one `unless` over a scope, each opponent asked in turn
// order (rule 101.4), the next only once the one before has declined, and
// `otherwise` only if none of them did. "That player" is the one who said yes,
// whose effect the option is: `who: "you"` in it is them, as Browbeat's is.
export default defineCard({
  name: "Sin Prodder",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "unless",
          chooser: { anyOf: "each-opponent" },
          options: [
            {
              doing: {
                kind: "sequence",
                effects: [
                  { kind: "put-into-graveyard", target: 0 },
                  { kind: "damage", amount: { manaValueOf: 0 }, who: "you" },
                ],
              },
              text: "Have them put the revealed card into their graveyard, and be dealt damage equal to its mana value",
            },
          ],
          otherwise: { kind: "return-to-hand", target: 0, from: "library" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
