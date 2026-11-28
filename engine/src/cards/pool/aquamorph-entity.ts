import { defineCard } from "../define.js";

// EDHREC rank 28148.
//
// Rulings:
//   If a creature enters as a copy of a face-up Aquamorph Entity, or a Vesuvan Shapeshifter turns
//     face up as a copy of one, the controller of the creature entering gets to make the choice.
//   If a creature that's already on the battlefield becomes a copy of a face-up Aquamorph Entity,
//     its power and toughness become the power and toughness that were chosen for the Entity.
//   The first ability is a replacement effect. The choice is made as Aquamorph Entity is turned
//     face up (or enters); it turns face up (or enters) as a creature of that size. It doesn't
//     become a 0/0 and then a creature of the chosen size.
//
// Primal Clay's `becomesOnEnter`, its form a copiable value (rule 707.2), asked again as it's
// turned face up (`orTurnedFaceUp`), before it turns. Its * and * are 0 anywhere but the
// battlefield.
export default defineCard({
  name: "Aquamorph Entity",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text:
    "As this creature enters or is turned face up, it becomes your choice of 5/1 or 1/5.\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  morph: { keyword: "morph", cost: "{2}{U}" },
  becomesOnEnter: {
    forms: [
      { label: "5/1", as: { power: 5, toughness: 1 } },
      { label: "1/5", as: { power: 1, toughness: 5 } },
    ],
    orTurnedFaceUp: true,
  },
});
