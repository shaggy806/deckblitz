import { defineCard } from "../define.js";

// EDHREC rank 25084. Rust's ability on a creature.
export default defineCard({
  name: "Brown Ouphe",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 1,
  text: "{1}{G}, {T}: Counter target activated ability from an artifact source. (Mana abilities can't be targeted.)",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [{ kind: "ability", abilityKind: "activated", sourceTypes: ["artifact"] }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{1}{G}, {T}: Counter target activated ability from an artifact source.",
    },
  ],
});
