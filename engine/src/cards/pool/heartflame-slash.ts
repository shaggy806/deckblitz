import { defineCard } from "../define.js";

export default defineCard({
  name: "Heartflame Slash",
  art: "https://cards.scryfall.io/art_crop/back/8/1/811b283f-22f3-47b1-a802-11dc8c25d0ee.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Heartflame Slash deals 3 damage to any target. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  faces: ["Heartflame Duelist", "Heartflame Slash"],
  adventure: true,
});
