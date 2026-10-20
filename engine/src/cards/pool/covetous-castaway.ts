import { defineCard } from "../define.js";

/** Disturb (rule 702.146): cast the back face, `Ghostly Castigator`, from
 * your graveyard for its disturb cost. */
export default defineCard({
  name: "Covetous Castaway",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 3,
  disturb: { cost: "{3}{U}{U}" },
  text: "When this creature dies, mill three cards. (Put the top three cards of your library into your graveyard.)\nDisturb {3}{U}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "When this creature dies, mill three cards.",
    },
  ],
  faces: ["Covetous Castaway", "Ghostly Castigator"],
  transform: true,
});
