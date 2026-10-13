import { defineCard } from "../define.js";

// EDHREC rank 8210.
//
// Rulings:
//   [2025-02-07] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2025-02-07] Multiple finality counters on a single permanent are redundant.
//   [2025-02-07] Finality counters don’t stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner’s hand from the battlefield, it does so normally.
//   [2025-02-07] Finality counters aren’t keyword counters, and a finality counter doesn’t give
//     any abilities to the permanent it’s on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.

const ETB_TEXT =
  "When this creature enters, put target creature card with mana value 4 or less from a graveyard onto the battlefield under your control with a finality counter on it. That creature gains menace, deathtouch, and haste. At the beginning of your next end step, exile that creature.";

export default defineCard({
  name: "Coalstoke Gearhulk",
  manaCost: "{1}{B}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 4,
  keywords: ["menace", "deathtouch"],
  text: `Menace, deathtouch\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature", manaValue: { op: "lte", n: 4 } } }],
      // Puppeteer Clique's shape, with Zoraline's finality counter. "Gains"
      // with no duration lasts as long as it stays.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "put-onto-battlefield",
            target: 0,
            underYourControl: true,
            withCounters: { kind: "finality", amount: 1 },
          },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "permanent" },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "permanent" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "your-next-end-step",
            effect: { kind: "exile", target: 0 },
            text: "At the beginning of your next end step, exile that creature.",
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
