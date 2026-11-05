import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Toby enters, create a 4/4 white Beast creature token with \"This token can't attack or block alone.\"";
const FLY_TEXT = "As long as you control four or more creature tokens, creature tokens you control have flying.";

export default defineCard({
  name: "Toby, Beastie Befriender",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${FLY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Beast Token (Can't Attack or Block Alone)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      condition: { kind: "controls", filter: { type: "creature", token: true }, atLeast: 4 },
      grantKeywords: ["flying"],
      text: FLY_TEXT,
    },
  ],
});
