import { defineCard } from "../define.js";

// EDHREC rank 8852.
//
// "Whenever one or more … enter" is a batched enters trigger (Merry, Warden of
// Isengard), and "this ability triggers only once each turn" its
// `oncePerTurn`.

const ARTIFACT_TEXT =
  "Whenever one or more artifacts you control enter, put two +1/+1 counters on this creature. This ability triggers only once each turn.";
const ENCHANTMENT_TEXT =
  "Whenever one or more enchantments you control enter, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Elvish Archivist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 0,
  toughness: 1,
  text: `${ARTIFACT_TEXT}\n${ENCHANTMENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: ARTIFACT_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENCHANTMENT_TEXT,
    },
  ],
});
