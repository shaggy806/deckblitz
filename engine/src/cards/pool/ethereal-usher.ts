import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

const USHER = "{U}, {T}: Target creature can't be blocked this turn.";
const TRANSMUTE_TEXT =
  "Transmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Ethereal Usher",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: `${USHER}\n${TRANSMUTE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: USHER,
    },
    transmute("{1}{U}{U}", 6, TRANSMUTE_TEXT),
  ],
});
