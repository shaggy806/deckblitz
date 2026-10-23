import { defineCard } from "../define.js";

// "Creatures you control with counters on them": a counter of any kind
// (`counters` with no `kind`), read on the source as the damage would be dealt.
export default defineCard({
  name: "Raphael, the Muscle",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 4,
  pairing: { kind: "partner-group", group: "Character select" },
  text: "Double all damage that creatures you control with counters on them would deal.\nWhen Raphael enters, create a Mutagen token.\nPartner—Character select (You can have two commanders if both have this ability.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        multiplier: 2,
        source: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      text: "Double all damage that creatures you control with counters on them would deal.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "When Raphael enters, create a Mutagen token.",
    },
  ],
});
