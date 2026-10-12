import { defineCard } from "../define.js";

export default defineCard({
  name: "Pia Nalaar",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "When Pia Nalaar enters, create a 1/1 colorless Thopter artifact creature token with flying.\n{1}{R}: Target artifact creature gets +1/+0 until end of turn.\n{1}, Sacrifice an artifact: Target creature can't block this turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: Target artifact creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "{1}, Sacrifice an artifact: Target creature can't block this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "When Pia Nalaar enters, create a 1/1 colorless Thopter artifact creature token with flying.",
    },
  ],
});
