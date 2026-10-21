import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] If the target permanent is an illegal target by the time Angelic Ascension tries
//     to resolve, the spell won't resolve. No player will create an Angel token.

export default defineCard({
  name: "Angelic Ascension",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature or planeswalker. Its controller creates a 4/4 white Angel creature token with flying.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "4/4 Angel Token", count: 1, who: "target-controller" },
    ],
  },
});
