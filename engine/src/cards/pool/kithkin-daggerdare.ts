import { defineCard } from "../define.js";

export default defineCard({
  name: "Kithkin Daggerdare",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{G}, {T}: Target attacking creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, {T}: Target attacking creature gets +2/+2 until end of turn.",
    },
  ],
});
