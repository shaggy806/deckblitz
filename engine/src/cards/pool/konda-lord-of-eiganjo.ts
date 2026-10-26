import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Champions of Kamigawa. EDHREC rank 15715.

export default defineCard({
  name: "Konda, Lord of Eiganjo",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "indestructible"],
  text: "Vigilance, indestructible\nBushido 5 (Whenever this creature blocks or becomes blocked, it gets +5/+5 until end of turn.)",
  triggered: [...bushido(5)],
});
