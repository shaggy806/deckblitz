import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27743. Spore Burst's domain token count.

export default defineCard({
  name: "Ordered Migration",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Domain — Create a 1/1 blue Bird creature token with flying for each basic land type among lands you control.",
  targets: [],
  effect: { kind: "create-token", token: "1/1 Blue Bird Token", count: { basicLandTypes: "you" } },
});
