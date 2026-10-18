import { defineCard } from "../define.js";

// EDHREC rank 6693.
//
// Compleated (rule 702.150a): two fewer loyalty counters if its {G/W/P} was
// paid with life. The +1 is Nylea, Keen-Eyed's reveal: a creature or
// planeswalker card must go to the hand; anything else may go to the bottom.
// The −3 is Storm the Seedcore's distribution (each target at least one
// counter, chosen as it's activated); only the targets gain vigilance.

const EMBLEM_TEXT = "Whenever you cast a creature or planeswalker spell, target opponent gets two poison counters.";

export default defineCard({
  name: "Ajani, Sleeper Agent",
  manaCost: "{1}{G}{G/W/P}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  compleated: true,
  text: `Compleated ({G/W/P} can be paid with {G}, {W}, or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)\n+1: Reveal the top card of your library. If it's a creature or planeswalker card, put it into your hand. Otherwise, you may put it on the bottom of your library.\n−3: Distribute three +1/+1 counters among up to three target creatures. They gain vigilance until end of turn.\n−6: You get an emblem with "${EMBLEM_TEXT}"`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "library-bottom" },
        leftover: "stay",
      },
      resolve: null,
      text: "+1: Reveal the top card of your library. If it's a creature or planeswalker card, put it into your hand. Otherwise, you may put it on the bottom of your library.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "creature", min: 0, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counters-divided", from: 0, counter: "+1/+1" },
          {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "−3: Distribute three +1/+1 counters among up to three target creatures. They gain vigilance until end of turn.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
            targets: ["opponent"],
            effect: { kind: "add-player-counters", counter: "poison", amount: 2, target: 0 },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: `−6: You get an emblem with "${EMBLEM_TEXT}"`,
    },
  ],
});
