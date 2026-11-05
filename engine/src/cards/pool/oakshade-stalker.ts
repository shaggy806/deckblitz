import { defineCard } from "../define.js";

// EDHREC rank 23232.

export default defineCard({
  name: "Oakshade Stalker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger", "Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["daybound"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  faces: ["Oakshade Stalker", "Moonlit Ambusher"],
  transform: true,
});
