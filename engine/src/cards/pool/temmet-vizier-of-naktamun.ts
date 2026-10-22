import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature token you control gets +1/+1 until end of turn and can't be blocked this turn.";
const EMBALM_TEXT =
  "Embalm {3}{W}{U} ({3}{W}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Human Cleric with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Temmet, Vizier of Naktamun",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${EMBALM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", token: true, controlledBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [embalmAbility("{3}{W}{U}", EMBALM_TEXT)],
});
