import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 27209.
//
// Ruling: the enchantment is chosen on resolution, not targeted — Natural
// Emergence itself qualifies.

const GATE = "When this enchantment enters, return a red or green enchantment you control to its owner's hand.";
const ANIMATE = "Lands you control are 2/2 creatures with first strike. They're still lands.";

export default defineCard({
  name: "Natural Emergence",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: `${GATE}\n${ANIMATE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "enchantment", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a red or green enchantment you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addTypes: ["creature"],
      setBasePt: { power: 2, toughness: 2 },
      grantKeywords: ["first-strike"],
      text: ANIMATE,
    },
  ],
});
