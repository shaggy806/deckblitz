import { defineCard } from "../define.js";

const PROTECT_TEXT = "{1}{W}: Target permanent you control gains protection from white until end of turn.";
const WHITE_TEXT = "{1}: Target spell or permanent becomes white until end of turn.";

export default defineCard({
  name: "Eight-and-a-Half-Tails",
  manaCost: "{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${PROTECT_TEXT}\n${WHITE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { controlledBy: "you" } }],
      effect: { kind: "grant-protection", target: 0, from: { colors: ["W"] }, duration: "end-of-turn" },
      resolve: null,
      text: PROTECT_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "spell-or-permanent" }],
      effect: { kind: "become", target: 0, setColors: ["W"], duration: "end-of-turn" },
      resolve: null,
      text: WHITE_TEXT,
    },
  ],
});
