import { defineCard } from "../define.js";

const ROLE_TEXT =
  "When Garruk's Lost Wolf enters the battlefield, create a Huntsman Role token attached to another target creature you control. (Enchanted creature gets +1/+1 and has \"{T}: Add {G}\")";

export default defineCard({
  name: "Garruk's Lost Wolf",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: ROLE_TEXT,
  faces: ["Garruk's Lost Wolf", "Hey, Has Anyone Seen Garruk?"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "create-token", token: "Huntsman Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: ROLE_TEXT,
    },
  ],
});
