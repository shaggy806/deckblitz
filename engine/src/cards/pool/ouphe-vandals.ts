import { defineCard } from "../define.js";

const TEXT =
  "{G}, Sacrifice this creature: Counter target activated ability from an artifact source and destroy that artifact if it's on the battlefield. (Mana abilities can't be targeted.)";

export default defineCard({
  name: "Ouphe Vandals",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: [{ kind: "ability", abilityKind: "activated", sourceTypes: ["artifact"] }],
      // Not "countered this way": the artifact goes whether or not the ability could be countered.
      effect: {
        kind: "counter",
        target: 0,
        thenSource: { effect: { kind: "destroy", target: 0 }, evenIfNotCountered: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
