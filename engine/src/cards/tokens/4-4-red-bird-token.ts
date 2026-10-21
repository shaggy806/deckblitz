import { defineCard } from "../define.js";

// A 4/4 red Bird with flying — Rukh Egg's token (Oracle: "a 4/4 red Bird
// creature token with flying"; its old printed token was a "Rukh"). "Bird
// Token" is Migratory Route's 1/1 white one; the engine keys tokens by name.
export default defineCard({
  name: "4/4 Red Bird Token",
  // Its only printing is the old "Rukh" token (P03), a 4/4 red flier.
  art: "b5489e26-6aec-4706-9c3e-8454878fa6c3",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying",
});
