import { defineCard } from "../define.js";

// EDHREC rank 6803.
//
// Rulings:
//   Acclaimed Contender's ability can get you at most one card from the top five cards, no
//     matter how many other Knights you control.
//   Acclaimed Contender's ability won't trigger if you don't control another Knight immediately
//     after it enters the battlefield. If you don't control another Knight as that ability
//     resolves, the ability has no effect. This doesn't have to be the same Knight at both times.
//
// An intervening-if (rule 603.4), checked as it triggers and again as it
// resolves — any other Knight each time. Astor, Bearer of Blades' look.

const TEXT =
  "When this creature enters, if you control another Knight, look at the top five cards of your library. You may reveal a Knight, Aura, Equipment, or legendary artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Acclaimed Contender",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Knight" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: {
          anyOf: [
            { subtype: "Knight" },
            { subtype: "Aura" },
            { subtype: "Equipment" },
            { type: "artifact", supertype: "legendary" },
          ],
        },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
