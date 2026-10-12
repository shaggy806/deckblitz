import { defineCard } from "../define.js";

export default defineCard({
  name: "Thraben Heretic",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{T}: Exile target creature card from a graveyard.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{T}: Exile target creature card from a graveyard.",
    },
  ],
});
