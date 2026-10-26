import { defineCard } from "../define.js";

const ABILITY =
  "{2}{U}, {T}: The controller of target instant or sorcery spell copies it. That player may choose new targets for the copy.";

export default defineCard({
  name: "Meletis Charlatan",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["instant-or-sorcery-spell"],
      // The spell's controller controls the copy and chooses its new targets (the rulings).
      effect: { kind: "copy-spell", target: 0, newTargets: true, controller: { controllerOfTarget: 0 } },
      resolve: null,
      text: ABILITY,
    },
  ],
});
