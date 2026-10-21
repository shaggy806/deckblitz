import { defineCard } from "../define.js";

// −3 is Rabid Bite's one-sided fight: an illegal target on either side and
// the creature deals no damage (the first ruling). −9 reaches only the
// creatures there as it resolves (the second) — Garruk Wildspeaker's shape.
export default defineCard({
  name: "Vivien of the Arkbow",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vivien"],
  loyalty: 5,
  text: "+2: Put two +1/+1 counters on up to one target creature.\n−3: Target creature you control deals damage equal to its power to target creature you don't control.\n−9: Creatures you control get +4/+4 and gain trample until end of turn.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "+2: Put two +1/+1 counters on up to one target creature.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      resolve: null,
      text: "−3: Target creature you control deals damage equal to its power to target creature you don't control.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 4,
            toughness: 4,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "−9: Creatures you control get +4/+4 and gain trample until end of turn.",
    },
  ],
});
