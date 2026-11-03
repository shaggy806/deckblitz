import { defineCard } from "../define.js";

// Apocalypse. An `unless` over everyone but the caster, in turn order, the next
// asked once the one before has declined; paying is what counters the spell, so
// it's the option's `ifPaid` and nothing happens otherwise. The mana cost is read
// off the spell: its colours, and the X chosen for it (rule 107.3h).

const TEXT =
  "Whenever a player casts a spell, any other player may pay that spell's mana cost. If a player does, counter the spell. (Mana cost includes color.)";

export default defineCard({
  name: "Ice Cave",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: { anyOf: "opponents-of-trigger-controller" },
        options: [
          {
            payManaCostOf: "trigger-object",
            text: "Pay {X}",
            ifPaid: { kind: "counter", target: "trigger-object" },
          },
        ],
        otherwise: { kind: "sequence", effects: [] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
