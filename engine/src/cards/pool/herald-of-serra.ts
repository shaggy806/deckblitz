import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 31038.

export default defineCard({
  name: "Herald of Serra",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nEcho {2}{W}{W} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{2}{W}{W}"),
  ],
});
