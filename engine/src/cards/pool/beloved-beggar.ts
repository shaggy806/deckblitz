import { defineCard } from "../define.js";

export default defineCard({
  name: "Beloved Beggar",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 0,
  toughness: 4,
  disturb: { cost: "{4}{W}{W}" },
  text: "Disturb {4}{W}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Beloved Beggar", "Generous Soul"],
  transform: true,
});
