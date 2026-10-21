import { defineCard } from "../define.js";

// EDHREC rank 11496.

export default defineCard({
  name: "Kyodai, Soul of Kamigawa",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen Kyodai enters, another target permanent gains indestructible for as long as you control Kyodai.\n{W}{U}{B}{R}{G}: Kyodai gets +5/+5 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "while-you-control-source" },
      resolve: null,
      text: "When Kyodai enters, another target permanent gains indestructible for as long as you control Kyodai.",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 5, toughness: 5, duration: "end-of-turn" },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: Kyodai gets +5/+5 until end of turn.",
    },
  ],
});
