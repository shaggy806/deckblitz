import { defineCard } from "../define.js";

// EDHREC rank 20250. If Yannik has left before the ability resolves, nothing is
// exiled and nothing triggers (the ruling). X is the exiled creature's power as
// it last existed, a token's too (the rulings); the targets and division are
// announced as the reflexive ability goes on the stack.
const PARTNER_TEXT =
  "Partner with Nikara, Lair Scavenger (When this creature enters, target player may put Nikara into their hand from their library, then shuffle.)";
const EXILE_TEXT =
  "When Yannik enters, exile another creature you control until Yannik leaves the battlefield. When you do, distribute X +1/+1 counters among any number of target creatures, where X is the exiled creature's power.";

export default defineCard({
  name: "Yannik, Scavenging Sentinel",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hyena", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  pairing: { kind: "partner-with", name: "Nikara, Lair Scavenger" },
  text: `${PARTNER_TEXT}\nVigilance\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Nikara, Lair Scavenger?",
        effect: {
          kind: "search-library",
          filter: { name: "Nikara, Lair Scavenger" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: PARTNER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              exceptSource: true,
              min: 1,
              upTo: 1,
              prompt: "Exile another creature you control until Yannik leaves the battlefield",
              then: { kind: "exile", target: 0, untilSourceLeaves: true },
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "any-number", of: "creature" }],
                value: { aggregate: "sum", of: "power", filter: {}, in: { thisWay: "exiled" } },
                divided: { total: { triggerValue: true }, slot: 0, of: "+1/+1 counters" },
                effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
                text: "Distribute X +1/+1 counters among any number of target creatures, where X is the exiled creature's power.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
