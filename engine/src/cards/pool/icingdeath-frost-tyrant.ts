import { defineCard } from "../define.js";

// EDHREC rank 11183. Its token, Icingdeath, Frost Tongue, is a named
// legendary Equipment token (tokens/icingdeath-frost-tongue.ts).

const DIES_TEXT =
  'When Icingdeath, Frost Tyrant dies, create Icingdeath, Frost Tongue, a legendary white Equipment artifact token with "Equipped creature gets +2/+0," "Whenever equipped creature attacks, tap target creature defending player controls," and equip {2}.';

export default defineCard({
  name: "Icingdeath, Frost Tyrant",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Icingdeath, Frost Tongue", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
