import { defineCard } from "../define.js";

// Rulings:
//   When it turns into a creature, it is no longer an enchantment.

const TEXT = "When you have 10 or less life, if this permanent is an enchantment, it becomes a 3/5 Soldier creature.";

export default defineCard({
  name: "Opal Avenger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "state", state: { kind: "life-total", who: "you", atMost: 10 } },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 5,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Soldier"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
