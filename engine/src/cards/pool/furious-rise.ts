import { defineCard } from "../define.js";

// Each exile ends the permission over the card before it, however long it has
// waited. This enchantment leaving ends nothing: it just can't exile another.
const TEXT =
  "At the beginning of your end step, if you control a creature with power 4 or greater, exile the top card of your library. You may play that card until you exile another card with this enchantment.";

export default defineCard({
  name: "Furious Rise",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-next-exile", play: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
