import { defineCard } from "../define.js";

// EDHREC rank 22348.
//
// Rulings:
//   [2022-12-08] The sacrifice occurs only if you cast it using its own ability. If you cast it
//     using some other effect (for example, if another effect allowed you to cast it as though it
//     had flash), then it won't be sacrificed.
//
// Flickering Ward's colour (rule 614.12) and protection that spares this Aura
// (rule 702.16n); Grave Servitude's flash-then-sacrifice.
export default defineCard({
  name: "Ward of Lights",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant creature\nAs this Aura enters, choose a color.\nEnchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { chosenColor: true, doesntRemoveSource: true },
      text: "Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
    },
  ],
});
