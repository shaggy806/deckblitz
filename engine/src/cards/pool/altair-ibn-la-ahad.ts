import { defineCard } from "../define.js";

// "For each creature card you own in exile with a memory counter on it": read
// after the exile, so the one just exiled counts, and a copy of the card as
// printed (rule 707.2). Each enters attacking whichever player or planeswalker
// its controller chooses (rule 508.4), and was never declared.
const TEXT =
  "Whenever Altaïr attacks, exile up to one target Assassin creature card from your graveyard with a memory counter on it. Then for each creature card you own in exile with a memory counter on it, create a tapped and attacking token that's a copy of it. Exile those tokens at end of combat.";

export default defineCard({
  name: "Altaïr Ibn-La'Ahad",
  manaCost: "{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Assassin" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, withCounters: { kind: "memory", amount: 1 } },
          {
            kind: "create-token-copy",
            of: {
              eachExiled: {
                type: "creature",
                ownedBy: "you",
                counters: { kind: "memory", compare: { op: "gte", n: 1 } },
              },
            },
            count: 1,
            tapped: true,
            attacking: "choose",
            exileAtEndOfCombat: true,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
