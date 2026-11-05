import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, return target instant, sorcery, or creature card from a graveyard to its owner's hand.";

export default defineCard({
  name: "Vampire Charmseeker",
  manaCost: "{6}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  assist: true,
  text: `Assist (Another player can pay up to {6} of this spell's cost.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["instant", "sorcery", "creature"] } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
