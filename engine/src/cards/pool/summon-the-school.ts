import { defineCard } from "../define.js";

const RETURN_TEXT = "Tap four untapped Merfolk you control: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Summon the School",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["kindred", "sorcery"],
  subtypes: ["Merfolk"],
  text: `Create two 1/1 blue Merfolk Wizard creature tokens.\n${RETURN_TEXT}`,
  effect: { kind: "create-token", token: "Merfolk Wizard Token", count: 2 },
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 4, filter: { subtype: "Merfolk", controlledBy: "you" } },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
