import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The grant reaches Emerin itself, an Angel
// Dragon.

const GRANT_TEXT =
  "Angels and Dragons you control have flying, lifelink, ward 2, and \"{R}: This creature gets +1/+0 until end of turn.\"";
const SADDLED_TEXT = "Whenever Emerin deals combat damage to a player while saddled, create two Treasure tokens.";

export default defineCard({
  name: "Emerin, Shivan Angel",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Dragon"],
  power: 4,
  toughness: 5,
  text: `${GRANT_TEXT}\nWhenever you sacrifice a Treasure, you gain 2 life.\n${SADDLED_TEXT}\nSaddle 4`,
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Angel", "Dragon"], controlledBy: "you" } },
      grantKeywords: ["flying", "lifelink"],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{2}" } },
          resolve: null,
          text: "Ward {2}",
        },
      ],
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: "{R}: This creature gets +1/+0 until end of turn.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 4, filter: { type: "creature" } },
      },
      targets: [],
      effect: { kind: "become-saddled", target: "source" },
      resolve: null,
      sorcerySpeed: true,
      saddle: true,
      text: "Saddle 4",
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Treasure" } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever you sacrifice a Treasure, you gain 2 life.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      whileCondition: { kind: "source", filter: { saddled: true } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: SADDLED_TEXT,
    },
  ],
});
