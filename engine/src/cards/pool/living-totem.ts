import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 27366.
export default defineCard({
  name: "Living Totem",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 2,
  toughness: 3,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nWhen this creature enters, you may put a +1/+1 counter on another target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on the target creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, you may put a +1/+1 counter on another target creature.",
    },
  ],
});
