import { defineCard } from "../define.js";

// Planar Chaos (PLC). Khalni Gem's untargeted choice: Dust Elemental itself
// may be one of the three, and with fewer than three creatures you return
// them all (the ruling — the minimum shrinks to what there is).
const TEXT = "When this creature enters, return three creatures you control to their owner's hand.";

export default defineCard({
  name: "Dust Elemental",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["flash", "flying", "fear"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying; fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: 3,
        min: 3,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return three creatures you control to their owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
