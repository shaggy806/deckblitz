import { defineCard } from "../define.js";

// EDHREC rank 14948. Deluge Virtuoso's tap-and-stun, over artifacts too.

const ENTER_TEXT =
  "When this creature enters, tap target artifact or creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const WARP_TEXT =
  "Warp {2}{U} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Mechanozoa",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Jellyfish"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${WARP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  warp: { cost: "{2}{U}" },
});
