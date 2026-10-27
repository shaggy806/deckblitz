import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29594. "Without flying" and "attacking you" are
// targeting restrictions (the ruling): a target that gains flying is illegal,
// and the whole ability does nothing — this creature stays too.
export default defineCard({
  name: "Hunting Kavu",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 3,
  text: "{1}{R}{G}, {T}: Exile this creature and target creature without flying that's attacking you.",
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying", attackingYou: true } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: "source" },
          { kind: "exile", target: 0 },
        ],
      },
      resolve: null,
      text: "{1}{R}{G}, {T}: Exile this creature and target creature without flying that's attacking you.",
    },
  ],
});
