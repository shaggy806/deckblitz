import { cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

const TEXT = "If a land is tapped for mana, it produces colorless mana instead of any other type.";

// EDHREC rank 26738. The type changes and the amount doesn't (the ruling), so a
// land that would add {W}{W} adds {C}{C}.
export default defineCard({
  name: "Ritual of Subdual",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${TEXT}`,
  static: [
    { affects: { scope: "self" }, manaProduction: [{ filter: { type: "land" }, produces: "C", tapper: "any" }], text: TEXT },
  ],
  triggered: [cumulativeUpkeep("{2}")],
});
