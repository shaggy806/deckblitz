import { defineCard } from "../define.js";

// EDHREC rank 9429.
//
// Its crew bonus (rule 702.122a) is crew's only — never saddle or teamwork —
// and its power stays 2 for everything else.
const TEXT = "This creature crews Vehicles as though its power were 2 greater.";

export default defineCard({
  name: "Hotshot Mechanic",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Fox", "Pilot"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, crewsAs: { plus: 2 }, text: TEXT }],
});
