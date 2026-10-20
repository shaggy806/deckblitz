import { defineCard } from "../define.js";

// Adventures in the Forgotten Realms Commander. The first ability is batched
// and once a turn; it reads the cards as they are in the graveyard (its
// ruling), and Sefris has to be on the battlefield to see them.
const VENTURE_TEXT =
  "Whenever one or more creature cards are put into your graveyard from anywhere, venture into the dungeon. This ability triggers only once each turn.";
const UNDEAD_TEXT =
  "Create Undead — Whenever you complete a dungeon, return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Sefris of the Hidden Ways",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Whenever one or more creature cards are put into your graveyard from anywhere, venture into the dungeon. This ability triggers only once each turn. (To venture into the dungeon, enter the first room or advance to the next room.)\nCreate Undead — Whenever you complete a dungeon, return target creature card from your graveyard to the battlefield.",
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "creature" }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
    {
      trigger: { on: "completes-dungeon", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: UNDEAD_TEXT,
    },
  ],
});
