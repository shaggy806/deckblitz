import { defineCard } from "../define.js";

// EDHREC rank 17674. The 0 is Mirage Mirror's `become-copy` of the source
// until end of turn (a copy of a creature, so not a planeswalker meanwhile —
// the ruling), and Gideon Jura's all-damage shield on the source for the
// turn. The −7 fixes the creatures it affects as it resolves (the ruling).

export default defineCard({
  name: "Oko, the Trickster",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Oko"],
  loyalty: 4,
  text: "+1: Put two +1/+1 counters on up to one target creature you control.\n0: Until end of turn, Oko becomes a copy of target creature you control. Prevent all damage that would be dealt to him this turn.\n−7: Until end of turn, each creature you control has base power and toughness 10/10 and gains trample.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "+1: Put two +1/+1 counters on up to one target creature you control.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: "0: Until end of turn, Oko becomes a copy of target creature you control. Prevent all damage that would be dealt to him this turn.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 10,
        toughness: 10,
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "−7: Until end of turn, each creature you control has base power and toughness 10/10 and gains trample.",
    },
  ],
});
