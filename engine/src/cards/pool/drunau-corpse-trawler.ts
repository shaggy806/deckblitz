import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, create a 2/2 black Zombie creature token.";
const DEATHTOUCH_TEXT = "{2}{B}: Target Zombie gains deathtouch until end of turn.";

export default defineCard({
  name: "Drunau Corpse Trawler",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${DEATHTOUCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Zombie" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH_TEXT,
    },
  ],
});
