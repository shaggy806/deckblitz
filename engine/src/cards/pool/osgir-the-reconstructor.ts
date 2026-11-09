import { defineCard } from "../define.js";

const COPY_TEXT =
  "{X}, {T}, Exile an artifact card with mana value X from your graveyard: Create two tokens that are copies of the exiled card. Activate only as a sorcery.";

// EDHREC rank 8291.
export default defineCard({
  name: "Osgir, the Reconstructor",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Artificer"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n{1}, Sacrifice an artifact: Target creature you control gets +2/+0 until end of turn.\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Sacrifice an artifact: Target creature you control gets +2/+0 until end of turn.",
    },
    {
      cost: {
        mana: "{X}",
        tap: true,
        exileFromGraveyard: { count: 1, filter: { type: "artifact", manaValue: { op: "eq", n: "x" } } },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token-copy", of: { paid: "exiled" }, count: 2 },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
