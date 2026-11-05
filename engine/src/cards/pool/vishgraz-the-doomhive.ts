import { defineCard } from "../define.js";

const ETB_TEXT =
  'When Vishgraz enters, create three 1/1 colorless Phyrexian Mite artifact creature tokens with toxic 1 and "This token can\'t block."';
const PT_TEXT = "Vishgraz gets +1/+1 for each poison counter your opponents have.";

export default defineCard({
  name: "Vishgraz, the Doomhive",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  toxic: 1,
  text: `Menace, toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${ETB_TEXT}\n${PT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Mite Token", count: 3 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { playerCounters: "poison", playerCountersOf: "opponents", pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
});
