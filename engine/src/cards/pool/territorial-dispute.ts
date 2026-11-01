import { defineCard } from "../define.js";

// EDHREC rank 29075.
//
// "Players can't play lands" is every player's, its controller's too, and
// every land from every zone (rule 305.2); putting a land onto the
// battlefield by an effect isn't playing it.
const UPKEEP = "At the beginning of your upkeep, sacrifice this enchantment unless you sacrifice a land.";
const LANDS_TEXT = "Players can't play lands.";

export default defineCard({
  name: "Territorial Dispute",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${LANDS_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", lands: {} },
      text: LANDS_TEXT,
    },
  ],
});
