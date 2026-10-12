import { defineCard } from "../define.js";

export default defineCard({
  name: "Flensermite",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Gremlin"],
  power: 1,
  toughness: 1,
  keywords: ["infect", "lifelink"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)",
});
