import { defineCard } from "../define.js";

// EDHREC rank 9474. The Mercenary is the shared OTJ token.
const DIES_TEXT =
  'When this creature dies, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Nezumi Linkbreaker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Warlock"],
  power: 1,
  toughness: 1,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
