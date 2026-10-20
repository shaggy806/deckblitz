import { defineCard } from "../define.js";

export default defineCard({
  name: "Overwhelmed Archivist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  disturb: { cost: "{3}{U}" },
  text: "When this creature enters, draw a card, then discard a card.\nDisturb {3}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "When this creature enters, draw a card, then discard a card.",
    },
  ],
  faces: ["Overwhelmed Archivist", "Archive Haunt"],
  transform: true,
});
