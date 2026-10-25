import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 20007.
//
// Rulings:
//   [2020-04-17] Frost Lynx's triggered ability can target a creature that's already tapped. That
//     creature won't untap during its controller's next untap step.
export default defineCard({
  name: "Frost Lynx",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.",
    },
  ],
});
