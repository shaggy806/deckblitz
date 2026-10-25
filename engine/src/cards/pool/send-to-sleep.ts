import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 19499.
//
// Rulings:
//   [2015-06-22] Spell mastery is checked as the spell resolves.
//   [2015-06-22] A target that's illegal as it resolves isn't tapped and isn't kept from
//     untapping.
//   [2015-06-22] A creature that changes controllers doesn't untap during its new controller's
//     next untap step.
//   [2015-06-22] An already-tapped target stays tapped and doesn't untap during its controller's
//     next untap step.
//
// Urza's Rebuff's "up to two target creatures"; with spell mastery, each tap
// also carries Junk Winder's "doesn't untap during its controller's next
// untap step" — whoever controls it then, tapped by this or already.
const MASTERY = { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } } as const;

export default defineCard({
  name: "Send to Sleep",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, those creatures don't untap during their controllers' next untap steps.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "conditional",
    condition: MASTERY,
    then: {
      kind: "sequence",
      effects: [
        { kind: "tap", target: 0, doesntUntapNext: true },
        { kind: "tap", target: 1, doesntUntapNext: true },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "tap", target: 0 },
        { kind: "tap", target: 1 },
      ],
    },
  },
});
