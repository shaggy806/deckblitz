import { defineCard } from "../define.js";

export default defineCard({
  name: "Panglacial Wurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 9,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhile you're searching your library, you may cast this card from your library.",
  castWhileSearchingLibrary: true,
});
