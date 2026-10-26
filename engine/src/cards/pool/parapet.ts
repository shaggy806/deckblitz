import { defineCard } from "../define.js";

export default defineCard({
  name: "Parapet",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nCreatures you control get +0/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      text: "Creatures you control get +0/+1.",
    },
  ],
});
