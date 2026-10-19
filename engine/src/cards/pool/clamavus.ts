import { defineCard } from "../define.js";

// EDHREC rank 7244.
//
// Toxrill, the Corrosive's shape: each creature is pumped by the +1/+1
// counters on itself (`countersOnAffected`), Clamavus included.
const HAILER_TEXT =
  "Proclamator Hailer — Each creature you control gets +1/+1 for each +1/+1 counter on it.";

export default defineCard({
  name: "Clamavus",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Tyranid", "Artificer"],
  power: 3,
  toughness: 3,
  text: HAILER_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantPtPerCount: { countersOnAffected: "+1/+1", pt: [1, 1] },
      text: HAILER_TEXT,
    },
  ],
});
