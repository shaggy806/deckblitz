import { defineCard } from "../define.js";

// EDHREC rank 10214.
//
// Rulings:
//   [2022-06-10] If you target a commander creature with Drillworks Mole's activated ability and
//     that creature is no longer a legal target as the ability resolves, you will not put a +1/+1
//     counter on Drillworks Mole. Conversely, if the target is still legal, you will put a counter
//     on the commander creature you control, even if Drillworks Mole is no longer on the
//     battlefield as the ability resolves.

const TEXT =
  "{2}, {T}: Put a +1/+1 counter on this creature and a +1/+1 counter on up to one target commander creature you control.";

export default defineCard({
  name: "Drillworks Mole",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Mole"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", isCommander: true } },
        },
      ],
      // A chosen target gone illegal makes the whole ability fizzle (rule
      // 608.2b — the ruling's "you will not put a +1/+1 counter on Drillworks
      // Mole"); with no target chosen, the Mole still gets its counter.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
