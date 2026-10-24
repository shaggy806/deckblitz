import { defineCard } from "../define.js";

// EDHREC rank 18562.
// Ruling: spell mastery is checked as the spell resolves.

const SPELL_MASTERY = {
  kind: "cards-in-graveyard",
  atLeast: 2,
  filter: { typesAnyOf: ["instant", "sorcery"] },
} as const;

export default defineCard({
  name: "Necromantic Summons",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put target creature card from a graveyard onto the battlefield under your control.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, that creature enters with two additional +1/+1 counters on it.",
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: {
    kind: "conditional",
    condition: SPELL_MASTERY,
    then: {
      kind: "put-onto-battlefield",
      target: 0,
      underYourControl: true,
      withCounters: { kind: "+1/+1", amount: 2 },
    },
    else: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
  },
});
