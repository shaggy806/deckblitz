import { defineCard } from "../define.js";

// EDHREC rank 10954. Secrets of Strixhaven Commander.
//
// Fleshbag Marauder's edict: in turn order each player chooses, then they're
// sacrificed together (the ruling). The counter trigger fires once per
// permanent sacrificed, by anyone (Carmen, Cruel Skymarcher) — the edict's
// own sacrifices included.
const EDICT_TEXT = "When this creature enters, each player sacrifices a creature of their choice.";
const GROW_TEXT = "Whenever a player sacrifices a permanent, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Merchant of Venom",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat", "Warlock"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${EDICT_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: EDICT_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
