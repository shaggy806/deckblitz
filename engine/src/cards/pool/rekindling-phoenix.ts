import { defineCard } from "../define.js";

// EDHREC rank 11920. The Elemental's upkeep ability is on its token
// (`tokens/elemental-token-rekindling-phoenix.ts`).

const TEXT =
  "When this creature dies, create a 0/1 red Elemental creature token with \"At the beginning of your upkeep, sacrifice this token and return target card named Rekindling Phoenix from your graveyard to the battlefield. It gains haste until end of turn.\"";

export default defineCard({
  name: "Rekindling Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (Rekindling Phoenix)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
