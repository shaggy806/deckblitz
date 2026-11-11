import { defineCard } from "../define.js";

// EDHREC rank 5866.
//
// Rulings:
//   [2023-06-02] If your commander is under the control of another player as Majestic Genesis
//     resolves, it is still on the battlefield and will still be used to determine the value of X.
//
// X counts only a commander on the battlefield or in the command zone
// (Cloudkill's amount).
const X = { greatestCommanderManaValue: true, onBattlefieldOrInCommandZone: true } as const;

export default defineCard({
  name: "Majestic Genesis",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top X cards of your library, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. You may put any number of permanent cards from among them onto the battlefield. Put the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: X,
    reveal: true,
    min: 0,
    max: X,
    filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
    destination: "battlefield",
    leftover: "bottom-random",
  },
});
