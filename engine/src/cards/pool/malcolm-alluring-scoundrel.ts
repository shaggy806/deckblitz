import { defineCard } from "../define.js";

// "The discarded card" is found where the discard put it (rule 400.7j): the
// graveyard, or exile when madness exiled it instead (702.35a) — cast from
// there before madness's own trigger resolves. The counter check reads
// Malcolm's last-known counters once it has left (its rulings). A land card
// is never cast, so it isn't offered (its rulings).
const TEXT =
  "Whenever Malcolm deals combat damage to a player, put a chorus counter on it. Draw a card, then discard a card. If there are four or more chorus counters on Malcolm, you may cast the discarded card without paying its mana cost.";

export default defineCard({
  name: "Malcolm, Alluring Scoundrel",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "chorus", amount: 1 },
          {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "chorus", compare: { op: "gte", n: 4 } },
            then: { kind: "cast-now", from: "discarded-this-way", free: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
