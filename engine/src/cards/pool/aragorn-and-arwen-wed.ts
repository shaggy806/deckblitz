import { defineCard } from "../define.js";

// EDHREC rank 6829.
//
// "Enters or attacks" is two triggers with one effect (Agent Frank
// Horrigan's shape). The life is counted after the counters go on, as the
// ability resolves — "other" leaves Aragorn and Arwen out of both halves.
const TEXT =
  "Whenever Aragorn and Arwen enters or attacks, put a +1/+1 counter on each other creature you control. You gain 1 life for each other creature you control.";
const EFFECT = {
  kind: "sequence",
  effects: [
    {
      kind: "add-counter-all",
      filter: { type: "creature", controlledBy: "you" },
      counter: "+1/+1",
      amount: 1,
      exceptSource: true,
    },
    { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true } },
  ],
} as const;

export default defineCard({
  name: "Aragorn and Arwen, Wed",
  manaCost: "{4}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Noble"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
