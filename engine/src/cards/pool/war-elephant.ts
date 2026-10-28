import { defineCard } from "../define.js";

export default defineCard({
  name: "War Elephant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 2,
  toughness: 2,
  keywords: ["trample", "banding"],
});
