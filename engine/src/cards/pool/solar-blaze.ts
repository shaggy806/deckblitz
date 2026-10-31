import { defineCard } from "../define.js";

// War of the Spark (WAR). EDHREC rank 10875. Each creature is the source of
// the damage it deals itself (its lifelink, deathtouch, infect), all at once.

export default defineCard({
  name: "Solar Blaze",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["sorcery"],
  text: "Each creature deals damage to itself equal to its power.",
  targets: [],
  effect: { kind: "each-deals-damage", filter: { type: "creature" }, amount: "its-power", to: "itself" },
});
