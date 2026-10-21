import { defineCard } from "../define.js";

// Bovine Intervention's shape: the Ox goes to the creature's controller
// whether or not it was destroyed (indestructible — the second ruling); an
// illegal target means no resolution and no Ox (the first).
const WAND_TEXT =
  "{1}, {T}, Remove a charge counter from this artifact: Destroy target creature. Its controller creates a 2/4 white Ox creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Transmogrifying Wand",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters with three charge counters on it.\n${WAND_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Ox Token (Ox Drover)", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: WAND_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 3 } },
      text: "This artifact enters with three charge counters on it.",
    },
  ],
});
