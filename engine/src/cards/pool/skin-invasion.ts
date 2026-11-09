import { defineCard } from "../define.js";

// The Aura's controller returns it, not the enchanted creature's (the ruling):
// "you" in a dies-attached trigger is the Aura's controller. Entering
// transformed it comes back as a creature, not an Aura, so nothing asks what
// it enchants.
const MUST_ATTACK_TEXT = "Enchanted creature attacks each combat if able.";
const DIES_TEXT = "When enchanted creature dies, return this card to the battlefield transformed under your control.";

export default defineCard({
  name: "Skin Invasion",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${MUST_ATTACK_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["must-attack"], text: MUST_ATTACK_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Skin Invasion", "Skin Shedder"],
  transform: true,
});
