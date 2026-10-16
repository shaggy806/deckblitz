import { defineCard } from "../define.js";

// EDHREC rank 15728.
//
// Rulings:
//   [2024-04-12] You pay all costs and follow all normal timing rules for spells cast from exile
//     with Bruse Tarl's last ability. For example, if you exile a creature card this way, you must
//     wait until your main phase to cast it.
//   [2024-04-12] If Bruse Tarl leaves the battlefield after other Oxen you control have dealt
//     first-strike damage but before regular combat damage, those Oxen won't deal regular combat
//     damage (unless they still have double strike for some other reason) .
//   [2024-04-12] Bruse Tarl's ability doesn't allow you to play land cards that it exiles. But
//     hey, free Oxen.

const TRIGGER_TEXT =
  "Whenever Bruse Tarl enters or attacks, exile the top card of your library. If it's a land card, create a 2/2 white Ox creature token. Otherwise, you may cast it until the end of your next turn.";

// The exiled card may only be *cast* (`castOnly`), so a land card it finds
// can't be played (the ruling) — it makes an Ox instead, read off the card
// as it sits in exile.
const EXILE_TOP = {
  kind: "sequence",
  effects: [
    { kind: "impulse-exile", amount: 1, duration: "your-next-turn", castOnly: true },
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "exiled", filter: { type: "land" } },
      then: { kind: "create-token", token: "Ox Token", count: 1 },
    },
  ],
} as const;

export default defineCard({
  name: "Bruse Tarl, Roving Rancher",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 3,
  text: `Oxen you control have double strike.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Ox", controlledBy: "you" } },
      grantKeywords: ["double-strike"],
      text: "Oxen you control have double strike.",
    },
  ],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EXILE_TOP, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EXILE_TOP, resolve: null, text: TRIGGER_TEXT },
  ],
});
