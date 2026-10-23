import { defineCard } from "../define.js";

// Patchwork Crawler's shape: the exile is linked to this creature (rule
// 607.2a), whose static grants the exiled cards' activated abilities — only
// those, and naming this creature where they name their own card (the
// rulings).
const EXILE_TEXT = "Imprint — {T}: Exile target artifact card from a graveyard.";
const GRANT_TEXT = "This creature has all activated abilities of all cards exiled with it.";

export default defineCard({
  name: "Myr Welder",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 4,
  text: `${EXILE_TEXT}\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "artifact" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOfLinkedExile: true,
      text: GRANT_TEXT,
    },
  ],
});
