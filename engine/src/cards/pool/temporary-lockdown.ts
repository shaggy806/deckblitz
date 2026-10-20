import { defineCard } from "../define.js";

// Every nonland permanent with mana value 2 or less — its own controller's
// too — exiled at once, and all returned the moment this leaves (rule 610.3 —
// `exile-all`'s `untilSourceLeaves`). An Aura returns attached to something
// its owner chooses (the ruling — `returnExiledCards`); a token is gone.
const TEXT =
  "When this enchantment enters, exile each nonland permanent with mana value 2 or less until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Temporary Lockdown",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "exile-all",
        filter: { notTypes: ["land"], manaValue: { op: "lte", n: 2 } },
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
