import { defineCard } from "../define.js";

export default defineCard({
  name: "Seething Song",
  // Pinned: Scryfall answers "Seething Song" by name with Blazing Firesinger // Seething Song, whose
  // prepare spell or adventure shares the name.
  art: "f493ce26-005c-4ddc-80f0-47bea4fd013a",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Add {R}{R}{R}{R}{R}.",
  effect: { kind: "add-mana", mana: "R", amount: 5 },
});
