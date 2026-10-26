import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 24735.
//
// Channel is a hand ability whose cost discards the card (`zone: "hand"`); "it" — the
// discarded card — deals the damage.
const PING_TEXT = "{X}{R}, {T}: Jiwari deals X damage to target creature without flying.";
const CHANNEL_TEXT = "Channel — {X}{R}{R}{R}, Discard this card: It deals X damage to each creature without flying.";

export default defineCard({
  name: "Jiwari, the Earth Aflame",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${PING_TEXT}\n${CHANNEL_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: { mana: "{X}{R}{R}{R}", tap: false },
      zone: "hand",
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
