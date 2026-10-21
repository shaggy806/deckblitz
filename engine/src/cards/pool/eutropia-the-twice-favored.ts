import { defineCard } from "../define.js";

// Any creature, Eutropia or the entering enchantment creature included (the
// rulings).
const CONSTELLATION_TEXT =
  "Constellation — Whenever an enchantment you control enters, put a +1/+1 counter on target creature. That creature gains flying until end of turn.";

export default defineCard({
  name: "Eutropia the Twice-Favored",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: CONSTELLATION_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CONSTELLATION_TEXT,
    },
  ],
});
