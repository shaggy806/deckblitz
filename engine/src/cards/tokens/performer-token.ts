import { defineCard } from "../define.js";

// A vanilla 2/2 white Performer (Night Out in Vegas). No token printing of it
// in the Oracle snapshot.
export default defineCard({
  name: "Performer Token",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Performer"],
  power: 2,
  toughness: 2,
  text: "",
});
