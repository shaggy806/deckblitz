import { defineCard } from "../define.js";

// EDHREC rank 18295.

const HEXPROOF_TEXT = "Lands you control have hexproof.";
const RETURN_TEXT = "{2}: Return target land card from your graveyard to your hand.";

export default defineCard({
  name: "Marwyn, the Preserver",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 2,
  text: `${HEXPROOF_TEXT} (They can't be the targets of spells or abilities your opponents control.)\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "lands-you-control" }, grantKeywords: ["hexproof"], text: HEXPROOF_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
