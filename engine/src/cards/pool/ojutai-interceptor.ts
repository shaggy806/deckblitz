import { defineCard } from "../define.js";

export default defineCard({
  name: "Ojutai Interceptor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "megamorph", cost: "{3}{U}" },
  text: "Flying\nMegamorph {3}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
