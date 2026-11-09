import { defineCard } from "../define.js";

// EDHREC rank 4137. The creature first, then this card, each from its own
// graveyard ("then"): the Aura is in the graveyard by the time the trigger
// resolves, moved by the state-based action of its host leaving.
const TEXT = "When enchanted creature dies, return it to the battlefield under your control, then return this card to the battlefield transformed under your control.";

export default defineCard({
  name: "Journey to Eternity",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TEXT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
          { kind: "put-onto-battlefield", target: "source", transformed: true, underYourControl: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Journey to Eternity", "Atzal, Cave of Eternity"],
  transform: true,
});
