import { defineCard } from "../define.js";

// EDHREC rank 28047.

export default defineCard({
  name: "Shrewd Hatchling",
  manaCost: "{3}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: "This creature enters with four -1/-1 counters on it.\n{U/R}: Target creature can't block this creature this turn.\nWhenever you cast a blue spell, remove a -1/-1 counter from this creature.\nWhenever you cast a red spell, remove a -1/-1 counter from this creature.",
  activated: [
    {
      cost: { mana: "{U/R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [{ kind: "cant-block", attacker: "source" }]},
      resolve: null,
      text: "{U/R}: Target creature can't block this creature this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Whenever you cast a blue spell, remove a -1/-1 counter from this creature.",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Whenever you cast a red spell, remove a -1/-1 counter from this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: "This creature enters with four -1/-1 counters on it.",
    },
  ],
});
