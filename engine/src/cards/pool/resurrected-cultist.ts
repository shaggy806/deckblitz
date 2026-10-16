import { defineCard } from "../define.js";

// EDHREC rank 24670. Gastal Thrillroller's graveyard return with a finality
// counter, gated on delirium ("Activate only if …", Bloodsoaked Champion's
// `condition` on a graveyard ability) — the card itself, a creature card in
// the graveyard, counts toward it.
//
// Rulings:
//   Finality counters don't stop permanents from going to zones other than the graveyard from the
//     battlefield. For example, if a permanent with a finality counter on it would be put into its
//     owner's hand from the battlefield, it does so normally.
//   Multiple finality counters on a single permanent are redundant.
//   Finality counters aren't keyword counters, and a finality counter doesn't give any abilities
//     to the permanent it's on. If that permanent loses its abilities and then would go to a
//     graveyard, it will still be exiled instead.
//   Finality counters work on any permanent, not only creatures. If a permanent with a finality
//     counter on it would be put into a graveyard from the battlefield, exile it instead.
const RETURN_TEXT =
  "Delirium — {2}{B}{B}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if there are four or more card types among cards in your graveyard and only as a sorcery.";

export default defineCard({
  name: "Resurrected Cultist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 4,
  toughness: 1,
  text: `${RETURN_TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      sorcerySpeed: true,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
