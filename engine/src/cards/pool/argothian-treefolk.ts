import { defineCard } from "../define.js";

// EDHREC rank 30407. A prevention replacement on damage to itself whose
// source is an artifact, whoever controls it.

const TEXT = "Prevent all damage that would be dealt to this creature by artifact sources.";

export default defineCard({
  name: "Argothian Treefolk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 3,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { type: "artifact" } },
      text: TEXT,
    },
  ],
});
