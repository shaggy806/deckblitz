import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 27883. Streets of New Capenna.
export default defineCard({
  name: "Angelic Observer",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Affinity for Citizens (This spell costs {1} less to cast for each Citizen you control.)\nFlying",
  selfCostReduction: affinity({ subtype: "Citizen" }),
});
