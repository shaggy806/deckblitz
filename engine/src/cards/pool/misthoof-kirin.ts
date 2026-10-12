import { defineCard } from "../define.js";

export default defineCard({
  name: "Misthoof Kirin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kirin"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  morph: { keyword: "megamorph", cost: "{1}{W}" },
  text: "Flying, vigilance\nMegamorph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
