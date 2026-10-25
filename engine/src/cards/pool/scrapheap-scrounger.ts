import { defineCard } from "../define.js";

// EDHREC rank 20039. The return is Postmortem Professor's graveyard ability;
// `exileFromGraveyard` never counts the source, which is "another".

const RETURN_TEXT =
  "{1}{B}, Exile another creature card from your graveyard: Return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Scrapheap Scrounger",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 2,
  text: `This creature can't block.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  activated: [
    {
      cost: {
        mana: "{1}{B}",
        tap: false,
        exileFromGraveyard: { count: 1, filter: { type: "creature" } },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
