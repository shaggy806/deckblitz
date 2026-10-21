import { defineCard } from "../define.js";

// EDHREC rank 16568. Dominaria.
//
// Rulings:
//   [2018-04-27] Territorial Allosaurus's ability can target another creature you control. If you
//     kicked it but your opponent controls no creatures that are legal targets, the ability must
//     target another one of your creatures.
//   [2018-04-27] If Territorial Allosaurus isn't on the battlefield as its triggered ability
//     resolves, or if the target of that ability is illegal, no creature will deal or be dealt
//     damage.

const TEXT = "When this creature enters, if it was kicked, it fights another target creature.";

export default defineCard({
  name: "Territorial Allosaurus",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  kicker: { cost: "{2}{G}" },
  text: `Kicker {2}{G} (You may pay an additional {2}{G} as you cast this spell.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
