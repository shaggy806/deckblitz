import { defineCard } from "../define.js";

export default defineCard({
  name: "Mourning Patrol",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  disturb: { cost: "{3}{W}" },
  text: "Vigilance\nDisturb {3}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Mourning Patrol", "Morning Apparition"],
  transform: true,
});
