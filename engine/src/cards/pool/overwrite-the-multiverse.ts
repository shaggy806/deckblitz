import { defineCard } from "../define.js";

// "Exile all creatures. Empower Jace X, where X is the number of creatures
// exiled this way": the exile's count (tokens too — they're exiled before
// they cease to exist), read before a Jace token is made. With none exiled
// it's empower Jace 0: a Jace token is still created if you have none, and
// dies to its 0 loyalty (rule 701.71a).
export default defineCard({
  name: "Overwrite the Multiverse",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all creatures. Empower Jace X, where X is the number of creatures exiled this way. (Put that many loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      { kind: "empower-jace", amount: { thisWay: "exiled" } },
    ],
  },
});
