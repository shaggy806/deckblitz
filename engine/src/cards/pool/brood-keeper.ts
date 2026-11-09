import { defineCard } from "../define.js";

const TEXT = "Whenever an Aura becomes attached to this creature, create a 2/2 red Dragon creature token with flying. It has \"{R}: This creature gets +1/+0 until end of turn.\"";

export default defineCard({
  name: "Brood Keeper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-attached", onto: "self", attachment: { subtype: "Aura" } },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Firebreathing)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
