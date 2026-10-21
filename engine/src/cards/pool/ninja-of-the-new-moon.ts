import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

export default defineCard({
  name: "Ninja of the New Moon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Ninja"],
  power: 6,
  toughness: 3,
  text: ninjutsuText("{3}{B}"),
  activated: [ninjutsu("{3}{B}")],
});
