import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, look at the top X cards of your library, where X is the number of Forests you control. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

// X is counted as the ability resolves (the ruling).
export default defineCard({
  name: "Nessian Game Warden",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { countOf: { subtype: "Forest", controlledBy: "you" } },
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
