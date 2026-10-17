import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Woman Who Walked the Earth — When Martha Jones enters, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
// "Martha Jones and up to one other target creature": Martha isn't a target,
// so she gets it whether or not a target is chosen — but if one is chosen and
// is illegal as the ability resolves, the ability does nothing (rule 608.2b).
const CLUE_TEXT =
  "Whenever you sacrifice a Clue, Martha Jones and up to one other target creature can't be blocked this turn.";

export default defineCard({
  name: "Martha Jones",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${ENTER_TEXT}\n${CLUE_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CLUE_TEXT,
    },
  ],
});
