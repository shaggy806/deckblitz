import { defineCard } from "../define.js";

// EDHREC rank 19585. The Channel ability is a hand ability that discards the
// card as its cost; "it" — the discarded card — deals the damage (Twinshot
// Sniper's shape), Silklash Spider's X damage to each flier.
const PING_TEXT = "{X}{G}, {T}: Arashi deals X damage to target creature with flying.";
const CHANNEL_TEXT = "Channel — {X}{G}{G}, Discard this card: It deals X damage to each creature with flying.";

export default defineCard({
  name: "Arashi, the Sky Asunder",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  text: `${PING_TEXT}\n${CHANNEL_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: { mana: "{X}{G}{G}", tap: false },
      zone: "hand",
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
