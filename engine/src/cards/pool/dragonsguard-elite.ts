import { defineCard } from "../define.js";

// EDHREC rank 16578.
const MAGECRAFT_TEXT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on this creature.";
const DOUBLE_TEXT = "{4}{G}{G}: Double the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Dragonsguard Elite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: `${MAGECRAFT_TEXT}\n${DOUBLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MAGECRAFT_TEXT,
    },
  ],
});
