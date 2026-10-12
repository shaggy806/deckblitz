import { defineCard } from "../define.js";

export default defineCard({
  name: "Krosan Constrictor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 2,
  keywords: ["swampwalk"],
  text: "Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n{T}: Target black creature gets -2/-0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target black creature gets -2/-0 until end of turn.",
    },
  ],
});
