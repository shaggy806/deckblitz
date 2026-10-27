import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 10668. Counts the nontoken creatures you own
// that died this turn, whoever controlled them (Fresh Meat's count, nontoken).

export default defineCard({
  name: "Caller of the Claw",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, create a 2/2 green Bear creature token for each nontoken creature put into your graveyard from the battlefield this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Bear Token",
        count: { turnHistory: "died", who: "each-player", filter: { type: "creature", ownedBy: "you", token: false } },
      },
      resolve: null,
      text: "When this creature enters, create a 2/2 green Bear creature token for each nontoken creature put into your graveyard from the battlefield this turn.",
    },
  ],
});
