import { defineCard } from "../define.js";

const TEXT =
  "Sacrifice a white creature: For each attacking red creature, prevent all combat damage that would be dealt by that creature this turn unless its controller pays {2}{R}.";

// Each controller answers as it resolves, in turn order (the payment can't
// wait — its ruling); paying only stops this prevention, not any other.
export default defineCard({
  name: "Heroism",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature", colors: ["W"] } } },
      targets: [],
      effect: {
        kind: "for-each-unless",
        of: { permanents: { type: "creature", colors: ["R"], attacking: true } },
        asks: "controller",
        options: [{ pay: "{2}{R}", text: "Pay {2}{R}" }],
        as: 0,
        otherwise: { kind: "damage-rule", by: { target: 0 }, combat: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
