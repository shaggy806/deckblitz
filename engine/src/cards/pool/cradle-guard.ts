import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 31024.

export default defineCard({
  name: "Cradle Guard",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nEcho {1}{G}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{1}{G}{G}"),
  ],
});
