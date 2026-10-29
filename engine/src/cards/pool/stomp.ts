import { defineCard } from "../define.js";

// Bonecrusher Giant's Adventure. "Damage can't be prevented this turn" goes
// first, so Stomp's own damage can't be prevented either.
export default defineCard({
  name: "Stomp",
  art: "https://cards.scryfall.io/art_crop/back/b/5/b5b71cd2-de35-451f-b16e-2e3936169407.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Damage can't be prevented this turn. Stomp deals 2 damage to any target.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage-cant-be-prevented" }, { kind: "damage", amount: 2, target: 0 }],
  },
  faces: ["Bonecrusher Giant", "Stomp"],
  adventure: true,
});
