import { defineCard } from "../define.js";

// Dance of the Tumbleweeds' X/X green Elemental creature token: it prints 0/0
// and gets its size from `create-token`'s `basePt` as it's made.

export default defineCard({
  name: "Elemental Token (Dance of the Tumbleweeds)",
  art: "008695e6-6d6f-4c16-bf05-377e8cc5f5ff",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
});
