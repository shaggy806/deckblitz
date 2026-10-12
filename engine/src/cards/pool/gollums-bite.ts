import { defineCard } from "../define.js";

export default defineCard({
  name: "Gollum's Bite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -2/-2 until end of turn.\n{3}{B}, Exile this card from your graveyard: The Ring tempts you. Activate only as a sorcery.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "{3}{B}, Exile this card from your graveyard: The Ring tempts you. Activate only as a sorcery.",
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
