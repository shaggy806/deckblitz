import { defineCard } from "../define.js";

// Rulings:
//   [2024-06-07] If Winter Moon is on the battlefield while another effect restricts untapping lands
//     or permanents in a different way, their effects are cumulative. For example, if you control
//     both Winter Moon and Static Orb, each player will be able to untap no more than two permanents,
//     up to one of which can be a nonbasic land, during their untap step.
//   [2024-06-07] If multiple Winter Moons are on the battlefield, their effects are redundant.

const TEXT = "Players can't untap more than one nonbasic land during their untap steps.";

export default defineCard({
  name: "Winter Moon",
  manaCost: "{2}",
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "each-player", count: 1, filter: { type: "land", notSupertype: "basic" } },
      text: TEXT,
    },
  ],
});
