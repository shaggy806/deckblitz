import { defineCard } from "../define.js";

const TEXT =
  "If one or more charge counters would be put on an artifact you control, that many plus one charge counters are put on it instead.";

export default defineCard({
  name: "Optimization Annex",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", instead: { modify: { plus: 1 } }, counterKind: "charge", filter: { type: "artifact" } },
      text: TEXT,
    },
  ],
});
