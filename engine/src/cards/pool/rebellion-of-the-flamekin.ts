import { defineCard } from "../define.js";

// EDHREC rank 30923.

export default defineCard({
  name: "Rebellion of the Flamekin",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["kindred", "enchantment"],
  subtypes: ["Elemental"],
  text: "Whenever you clash, you may pay {1}. If you do, create a 3/1 red Elemental Shaman creature token. If you won, that token gains haste until end of turn. (This ability triggers after the clash ends.)",
  triggered: [
    {
      // "If you won" is settled before this resolves (the clash is over), so
      // the token is made with haste or without: one offer to pay {1} either way.
      trigger: { on: "clashes", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-value", compare: { op: "gte", n: 1 } },
        then: {
          kind: "may",
          prompt: "Pay {1} to create a 3/1 red Elemental Shaman creature token with haste until end of turn?",
          cost: "{1}",
          effect: { kind: "create-token", token: "Elemental Shaman Token", count: 1, gainUntilEndOfTurn: ["haste"] },
        },
        else: {
          kind: "may",
          prompt: "Pay {1} to create a 3/1 red Elemental Shaman creature token?",
          cost: "{1}",
          effect: { kind: "create-token", token: "Elemental Shaman Token", count: 1 },
        },
      },
      resolve: null,
      text: "Whenever you clash, you may pay {1}. If you do, create a 3/1 red Elemental Shaman creature token. If you won, that token gains haste until end of turn.",
    },
  ],
});
