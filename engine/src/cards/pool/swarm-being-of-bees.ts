import { defineCard } from "../define.js";

export default defineCard({
  name: "Swarm, Being of Bees",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  mayhem: { cost: "{B}" },
  text: "Flash\nFlying\nMayhem {B} (You may cast this card from your graveyard for {B} if you discarded it this turn. Timing rules still apply.)",
});
