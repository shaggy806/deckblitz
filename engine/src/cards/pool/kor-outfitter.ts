import { defineCard } from "../define.js";

// Brass Squire's attach, as a "may" enters trigger. It may target itself
// (its ruling).

const TEXT = "When this creature enters, you may attach target Equipment you control to target creature you control.";

export default defineCard({
  name: "Kor Outfitter",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }, "creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Attach the Equipment to the creature?",
        effect: { kind: "attach", target: 1, attachment: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
