import { defineCard } from "../define.js";

// The Legend of Kuruk's back face. Invasion Submersible's exhaust waterbend.

const SPIRIT_TEXT =
  "Whenever you cast a spell, create a 1/1 colorless Spirit creature token with \"This token can't block or be blocked by non-Spirit creatures.\"";
const TURN_TEXT =
  "Exhaust — Waterbend {20}: Take an extra turn after this one. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}. Activate each exhaust ability only once.)";

export default defineCard({
  name: "Avatar Kuruk",
  art: "https://cards.scryfall.io/art_crop/back/5/e/5e9a53d3-7f2f-4a9c-9516-0713da740478.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 3,
  text: `${SPIRIT_TEXT}\n${TURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 1 },
      resolve: null,
      text: SPIRIT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{20}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: TURN_TEXT,
      exhaust: true,
    },
  ],
  faces: ["The Legend of Kuruk", "Avatar Kuruk"],
  transform: true,
});
