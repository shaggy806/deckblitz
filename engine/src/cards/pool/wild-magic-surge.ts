import { defineCard } from "../define.js";

// The reveal is the destroyed permanent's controller's, as it last existed,
// and what stops it is a permanent card sharing a card type with that
// permanent as it last existed (rule 608.2h) — `sharesCardTypeWith` of the
// target slot. It happens even if the permanent wasn't destroyed
// (indestructible): nothing in the text hangs on it.
export default defineCard({
  name: "Wild Magic Surge",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Destroy target permanent an opponent controls. Its controller reveals cards from the top of their library until they reveal a permanent card that shares a card type with that permanent. They put that card onto the battlefield and the rest on the bottom of their library in a random order.",
  targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "reveal-until",
        whose: { controllerOf: 0 },
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          sharesCardTypeWith: 0,
        },
        put: "battlefield",
        rest: "bottom-random",
      },
    ],
  },
});
