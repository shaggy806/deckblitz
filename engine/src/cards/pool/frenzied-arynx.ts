import { defineCard } from "../define.js";

export default defineCard({
  name: "Frenzied Arynx",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["riot", "trample"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nTrample\n{4}{R}{G}: This creature gets +3/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{4}{R}{G}: This creature gets +3/+0 until end of turn.",
    },
  ],
});
