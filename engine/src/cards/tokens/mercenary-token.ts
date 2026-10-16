import { defineCard } from "../define.js";

// The 1/1 red Mercenary of Outlaws of Thunder Junction and its Commander decks.
export default defineCard({
  name: "Mercenary Token",
  art: "5f04607f-eed2-462e-897f-82e41e5f7049",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mercenary"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
