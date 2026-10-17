import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add an amount of {C} equal to the number of time counters on this artifact.";

export default defineCard({
  name: "Rotating Fireplace",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped with a time counter on it.\n${MANA_TEXT}\n{4}, {T}: Time travel. Activate only as a sorcery. (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "time", amount: 1 } },
      text: "This artifact enters tapped with a time counter on it.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { countersOn: "source", counter: "time" } },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "time-travel" },
      resolve: null,
      text: "{4}, {T}: Time travel. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
