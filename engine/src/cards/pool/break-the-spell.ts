import { defineCard } from "../define.js";

// EDHREC rank 14894.
//
// Rulings:
//   [2023-09-01] If the enchantment has indestructible, it won't be destroyed. You won't draw a
//     card.
//   [2023-09-01] If a permanent you controlled or a token is destroyed with Break the Spell but is
//     put into a zone other than a graveyard as a result, you will draw a card.
//
// "Destroyed" this way (not "died"), so a replacement that sends it elsewhere
// still counts; "a permanent you controlled" is its controller as it left.

export default defineCard({
  name: "Break the Spell",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target enchantment. If a permanent you controlled or a token was destroyed this way, draw a card.",
  targets: ["enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            { kind: "this-way", what: "destroyed", who: "you" },
            { kind: "this-way", what: "destroyed", filter: { token: true } },
          ],
        },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
