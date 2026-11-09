import { defineCard } from "../define.js";

// Top-5000 #3376. Only creatures it could legally go on are offered (the
// ruling); each is its own "you may".
export default defineCard({
  name: "Inventory Management",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nFor each Aura and Equipment you control, you may attach it to a creature you control.",
  effect: {
    kind: "for-each-permanent",
    filter: { subtypes: ["Aura", "Equipment"], controlledBy: "you" },
    effect: {
      kind: "attach",
      attachment: 0,
      target: {
        among: { type: "creature", controlledBy: "you" },
        prompt: "You may attach it to a creature you control",
        optional: true,
      },
    },
  },
});
