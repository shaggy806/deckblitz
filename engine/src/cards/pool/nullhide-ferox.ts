import { defineCard } from "../define.js";

const PROHIBIT_TEXT = "You can't cast noncreature spells.";
const LOSE_TEXT = "{2}: This creature loses all abilities until end of turn. Any player may activate this ability.";
const DISCARD_TEXT =
  "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield instead of putting it into your graveyard.";

export default defineCard({
  name: "Nullhide Ferox",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["hexproof"],
  text: `Hexproof\n${PROHIBIT_TEXT}\n${LOSE_TEXT}\n${DISCARD_TEXT}`,
  discardedByOpponentEnters: {},
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "cast", who: "you", filter: { notTypes: ["creature"] } }], text: PROHIBIT_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "become", loseAbilities: true, target: "source", duration: "end-of-turn" },
      resolve: null,
      text: LOSE_TEXT,
      anyPlayer: true,
    },
  ],
});
