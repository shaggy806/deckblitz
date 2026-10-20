import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 17534.

export default defineCard({
  name: "Blade-Blizzard Kitsune",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Ninja"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `${ninjutsuText("{3}{W}")}\nDouble strike`,
  activated: [ninjutsu("{3}{W}")],
});
