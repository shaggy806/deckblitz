import { defineCard } from "../define.js";

// EDHREC rank 30633. Only the permanent losing its Auras is targeted; the one
// receiving them is chosen as this resolves, not that one, under the same
// controller, and able to take every one of them (the rulings).
const TEXT =
  "When this creature enters, attach all Auras enchanting target permanent to another permanent with the same controller.";

export default defineCard({
  name: "Glamer Spinners",
  manaCost: "{4}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: {
        kind: "attach",
        attachment: { all: { inSet: { attachmentsOf: 0 }, subtype: "Aura" } },
        target: {
          among: { controlledByRef: { controllerOf: 0 } },
          prompt: "Choose another permanent with the same controller to attach them to",
          another: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
