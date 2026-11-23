import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "You can't cast ~ during your first seven
// turns of the game" is Serra Avenger's gate at seven: it counts your own
// turns, so on another player's turn (with flash from somewhere) it's
// castable. The hat is a named legendary token (yellow-hat.ts).

const CAST_TEXT =
  "You can't cast Keeper of the Yellow Hat during your first seven turns of the game. (Keep track if you're playing with this!)";
const ENTERS_TEXT =
  "When The Keeper of the Yellow Hat enters the battlefield, create a legendary artifact equipment token named Yellow Hat with equip {2} and \"Equipped creature gets +4/+4 and gains lifelink.\"";

export default defineCard({
  name: "The Keeper of the Yellow Hat",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${CAST_TEXT}\n${ENTERS_TEXT}`,
  castOnlyIf: {
    kind: "not",
    of: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turns-taken", atMost: 7 }] },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Yellow Hat", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
