import { defineCard } from "../define.js";

// EDHREC rank 19259. Heroic as Akroan Skyguard has it, plus Oko, the
// Trickster's "prevent all damage that would be dealt to him this turn".
const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature and prevent all damage that would be dealt to it this turn.";

export default defineCard({
  name: "Favored Hoplite",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
