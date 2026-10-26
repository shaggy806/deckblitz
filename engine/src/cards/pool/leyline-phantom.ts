import { defineCard } from "../define.js";

// EDHREC rank 29537. "Whenever this deals combat damage", to anything: a
// `deals-damage` with no recipient fires once per simultaneous damage event
// (rule 603.2c). One that died in that combat is a new object in the
// graveyard, so "return it" finds nothing (rule 400.7).

const TEXT = "When this creature deals combat damage, return it to its owner's hand.";

export default defineCard({
  name: "Leyline Phantom",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 5,
  toughness: 5,
  text: `${TEXT} (Return it only if it survived combat.)`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", combat: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
