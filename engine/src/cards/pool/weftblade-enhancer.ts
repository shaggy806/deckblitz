import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 19038. Rishkar, Peema Renegade's enters shape.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on each of up to two target creatures.";

export default defineCard({
  name: "Weftblade Enhancer",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Drix", "Artificer"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\nWarp {2}{W} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{2}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, "creature", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
