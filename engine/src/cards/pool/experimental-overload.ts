import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You exile Experimental Overload even if you don't return a card to your hand.
//   [2020-06-23] The value of X is determined only as Experimental Overload resolves. The Weird's
//     power and toughness don't change if the number of instant and sorcery cards in your
//     graveyard changes. (A base P/T set once, as it's created.)
//   [2020-06-23] Because Experimental Overload is still on the stack while it's resolving, it
//     doesn't count towards the value of X.

const X = { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } } as const;

export default defineCard({
  name: "Experimental Overload",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Create an X/X blue and red Weird creature token, where X is the number of instant and sorcery cards in your graveyard. Then you may return an instant or sorcery card from your graveyard to your hand. Exile Experimental Overload.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token",
        token: "X/X Blue Red Weird Token",
        count: 1,
        basePt: { power: X, toughness: X },
      },
      // Not targeted: the card is chosen as this resolves (Grapple with the Past's shape).
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
    ],
  },
  exileOnResolve: true,
});
