import { defineCard } from "../define.js";

// EDHREC rank 12939.
//
// Inspired is the becomes-untapped trigger (Pain Seer's). The top card is
// revealed whatever it is; an artifact, creature or land card may be put
// onto the battlefield with a manifestation counter, an enchantment as it
// enters (`enterAs`, rule 614.12 — so constellation sees it, the ruling) and
// for as long as it stays, whether or not the counter does (the ruling).
// Declined, or of another type, it stays on top.
const INSPIRED =
  "Inspired — Whenever this creature becomes untapped, reveal the top card of your library. If it's an artifact, creature, or land card, you may put it onto the battlefield with a manifestation counter on it. That permanent is an enchantment in addition to its other types.";

export default defineCard({
  name: "Arbiter of the Ideal",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${INSPIRED}`,
  triggered: [
    {
      trigger: { on: "event", event: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["artifact", "creature", "land"] },
        destination: "battlefield",
        withCounters: { kind: "manifestation", amount: 1 },
        enterAs: { addTypes: ["enchantment"] },
        leftover: "stay",
        reveal: true,
      },
      resolve: null,
      text: INSPIRED,
    },
  ],
});
