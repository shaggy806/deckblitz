import { defineCard } from "../define.js";

// EDHREC rank 2228.
//
// Ruling: to double the number of a kind of counters on a permanent, put a
// number of that kind of counters on it equal to the number it already has —
// so a counter doubler applies. Doubling the counters you have is
// `double-counters` with `target: "you"`: energy included (rule 122.1).
const TEXT =
  "{T}: Add one mana of any color.\n{4}, {T}: Choose one. Activate only as a sorcery.\n• Double the number of each kind of counter on target permanent.\n• Double the number of each kind of counter you have.";

export default defineCard({
  name: "Aetheric Amplifier",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{4}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Double the number of each kind of counter on target permanent.",
            targets: ["permanent"],
            effect: { kind: "double-counters", target: 0 },
          },
          {
            text: "Double the number of each kind of counter you have.",
            effect: { kind: "double-counters", target: "you" },
          },
        ],
      },
      resolve: null,
      text: "{4}, {T}: Choose one. Activate only as a sorcery.",
    },
  ],
});
