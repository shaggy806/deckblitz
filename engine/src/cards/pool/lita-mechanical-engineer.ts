import { defineCard } from "../define.js";

// EDHREC rank 9005.
const UNTAP_TEXT = "At the beginning of your end step, untap each other artifact creature you control.";
const ZEPPELIN_TEXT =
  "{3}{W}, {T}: Create a 5/5 colorless Vehicle artifact token named Zeppelin with flying and crew 3. (It has \"Tap any number of creatures you control with total power 3 or more: This token becomes an artifact creature until end of turn.\")";

export default defineCard({
  name: "Lita, Mechanical Engineer",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${UNTAP_TEXT}\n${ZEPPELIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "untap-all",
        filter: { types: ["artifact", "creature"], controlledBy: "you" },
        exceptSource: true,
      },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Zeppelin", count: 1 },
      resolve: null,
      text: "{3}{W}, {T}: Create a 5/5 colorless Vehicle artifact token named Zeppelin with flying and crew 3.",
    },
  ],
});
