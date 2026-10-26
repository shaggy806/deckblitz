import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 25196. Petalmane Baku's ki counters,
// spent on Word of Binding's "tap X target creatures".
const CAST = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.";
const TAP = "{1}, Remove X ki counters from this creature: Tap X target creatures.";

export default defineCard({
  name: "Waxmane Baku",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: `${CAST}\n${TAP}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "ki", count: "x" } },
      targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: TAP,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Waxmane Baku?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
