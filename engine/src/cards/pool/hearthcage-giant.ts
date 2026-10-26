import { defineCard } from "../define.js";

export default defineCard({
  name: "Hearthcage Giant",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 5,
  text: "When this creature enters, create two 3/1 red Elemental Shaman creature tokens.\nSacrifice an Elemental: Target Giant creature gets +3/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Elemental" } } },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", subtype: "Giant" } }],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice an Elemental: Target Giant creature gets +3/+1 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Shaman Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 3/1 red Elemental Shaman creature tokens.",
    },
  ],
});
