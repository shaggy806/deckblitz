import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 20386.
//
// Each creature's colour is asked as its combat damage would be dealt, not
// as this resolves (the ruling).

export default defineCard({
  name: "Hunter's Ambush",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by nongreen creatures this turn.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage", by: { type: "creature", notColors: ["G"] } },
});
