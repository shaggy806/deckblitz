import { defineCard } from "../define.js";

// EDHREC rank 17916.
//
// Rulings:
//   The ability only triggers when one or more creatures attack you. It will not trigger on
//     creatures attacking a planeswalker you control.
//
// `attacks-player` fires once per player attacked, and never for an attack on a
// planeswalker (rule 508.3a). The life is one for each attacking creature, as
// the Oracle text reads, counted as it resolves.

const TEXT = "Whenever one or more creatures attack you, you gain 1 life for each attacking creature.";

export default defineCard({
  name: "Orim's Prayer",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
