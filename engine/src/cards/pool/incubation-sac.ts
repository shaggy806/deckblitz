import { defineCard } from "../define.js";

// EDHREC rank 20545.
// Makes Phyrexian Golem → use "Phyrexian Golem Token".

export default defineCard({
  name: "Incubation Sac",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  text: "This artifact enters with three oil counters on it.\n{4}, {T}, Remove an oil counter from this artifact: Create a 3/3 colorless Phyrexian Golem artifact creature token. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{4}", tap: true, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: "{4}, {T}, Remove an oil counter from this artifact: Create a 3/3 colorless Phyrexian Golem artifact creature token. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 3 } },
      text: "This artifact enters with three oil counters on it.",
    },
  ],
});
