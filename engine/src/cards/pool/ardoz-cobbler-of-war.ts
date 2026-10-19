import { defineCard } from "../define.js";

// EDHREC rank 10341.
const ENTER_TEXT = "Whenever Ardoz or another creature you control enters, that creature gets +2/+0 until end of turn.";
const TOKEN_TEXT = "{3}{R}: Create a 1/1 red Goblin creature token with haste. Activate only as a sorcery.";

export default defineCard({
  name: "Ardoz, Cobbler of War",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      // Ardoz itself included ("Ardoz or another creature").
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token (Haste)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
      sorcerySpeed: true,
    },
  ],
});
