import { defineCard } from "../define.js";

const TEXT = "{2}{B}, Exile an Elf card from your graveyard: This creature gets +3/+3 until end of turn.";

export default defineCard({
  name: "Scarred Vinebreeder",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, exileFromGraveyard: { count: 1, filter: { subtype: "Elf" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
