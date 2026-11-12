import { defineCard } from "../define.js";

// EDHREC rank 12677. Aang, at the Crossroads' look, onto the battlefield tapped
// and attacking (its controller picks what it attacks, rule 508.4).

const ATTACK_TEXT =
  "Whenever Jet attacks, look at the top five cards of your library. You may put a creature card with mana value 3 or less from among them onto the battlefield tapped and attacking. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Jet, Rebel Leader",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 3,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        attacking: "choose",
        leftover: "bottom-random",
        filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
