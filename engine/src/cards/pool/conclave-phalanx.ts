import { defineCard } from "../define.js";

// EDHREC rank 20388.

const TRIGGER = "When this creature enters, you gain 1 life for each creature you control.";

export default defineCard({
  name: "Conclave Phalanx",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${TRIGGER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
