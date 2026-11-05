import { defineCard } from "../define.js";

// EDHREC rank 14443.

const ATTACK = "Whenever Killmonger attacks, he gets +1/+0 until end of turn for each artifact defending player controls.";
const DAMAGE =
  "Whenever Killmonger deals combat damage to a player, that player sacrifices an artifact of their choice and you create a Treasure token.";

export default defineCard({
  name: "Killmonger, Ruthless Usurper",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACK}\n${DAMAGE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "trigger-player", filter: { type: "artifact" }, count: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
