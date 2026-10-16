import { defineCard } from "../define.js";

// EDHREC rank 16220.

const TEXT =
  'When this creature enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Prickly Pair",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Plant", "Mercenary"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
