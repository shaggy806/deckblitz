import { defineCard } from "../define.js";

// "One or more blocking creatures": once per combat damage step however many
// of its blockers it hits (`batched`, rule 603.2c), not once each.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to one or more blocking creatures, manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Arashin War Beast",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: DAMAGE_TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", toFilter: { blocking: true }, combat: true, batched: true },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
