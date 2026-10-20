import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 16712. Ninjutsu (rule 702.49) — Nezumi Prowler's helper.

export default defineCard({
  name: "Dokuchi Shadow-Walker",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Ninja"],
  power: 5,
  toughness: 5,
  text: ninjutsuText("{3}{B}"),
  activated: [ninjutsu("{3}{B}")],
});
