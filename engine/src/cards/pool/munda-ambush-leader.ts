import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 18921.
//
// Rally — Ondu Cleric's `thisOrAnother` pair. The look is optional ("you may
// look … If you do"); the Allies taken are revealed and go on top in the
// order picked, the rest to the bottom in an order Munda's controller
// chooses — Planar Atlas's shape with any number taken.
const TEXT =
  "Rally — Whenever Munda or another Ally you control enters, you may look at the top four cards of your library. If you do, reveal any number of Ally cards from among them, then put those cards on top of your library in any order and the rest on the bottom in any order.";

export default defineCard({
  name: "Munda, Ambush Leader",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kor", "Ally"],
  power: 3,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at the top four cards of your library?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          reveal: "chosen",
          min: 0,
          max: 4,
          filter: { subtype: "Ally" },
          destination: "library-top",
          leftover: "bottom-any-order",
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
