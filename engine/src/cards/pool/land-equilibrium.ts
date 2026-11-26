import { defineCard } from "../define.js";

// Legends (LEG).
//
// Rulings:
//   This effect applies no matter how the land would enter: because an opponent plays it, or
//     because a spell or ability allows that opponent to put it onto the battlefield. It doesn't
//     matter under whose control the land enters.
//   If an opponent puts a land onto the battlefield under their own control, they may sacrifice
//     that same land. The player won't be able to tap that land for mana before sacrificing it.
//
// An `others-enter-battlefield` replacement with `putBy` (the player putting the land there, read
// before it enters) and `thenPutter`: the land enters, then that player sacrifices a land of their
// choice as Land Equilibrium's effect (rule 614.1a).

const TEXT =
  "If an opponent who controls at least as many lands as you do would put a land onto the battlefield, that player instead puts that land onto the battlefield then sacrifices a land of their choice.";

export default defineCard({
  name: "Land Equilibrium",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "land" },
        putBy: { who: "opponent", controlsAtLeastAsMany: { type: "land" } },
        thenPutter: { kind: "sacrifice", who: "trigger-player", filter: { type: "land" }, count: 1 },
      },
      text: TEXT,
    },
  ],
});
