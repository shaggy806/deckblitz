import { defineCard } from "../define.js";

// EDHREC rank 25603.

export default defineCard({
  name: "Spore Burst",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Domain — Create a 1/1 green Saproling creature token for each basic land type among lands you control.",
  targets: [],
  effect: { kind: "create-token", token: "Saproling Token", count: { basicLandTypes: "you" } },
});
