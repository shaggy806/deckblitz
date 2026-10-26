import { defineCard } from "../define.js";

// Akroan Crusader's Soldier token: "a 1/1 red Soldier creature token with
// haste" — the haste is part of the token's definition (rule 111.4), so a copy
// of it has haste too. (The tuma printing whose art this pins omits it.)

export default defineCard({
  name: "1/1 Red Soldier Token",
  art: "039b8e44-b435-4e05-b94c-02c4dda11943",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
