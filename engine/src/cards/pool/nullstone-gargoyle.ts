import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 14962.
//
// "The first noncreature spell of a turn" is the turn's first, whoever cast
// it — not each caster's first (`firstEachTurn`) — so it's a trigger
// condition (`whileCondition`, rule 603.1) counting every player's
// noncreature spells this turn, the one just cast included: exactly one. It
// counts spells cast before the Gargoyle arrived (the second ruling), and,
// being no intervening "if", isn't asked again on resolution, so a second
// noncreature spell cast in response doesn't save the first (the first
// ruling) — nor is that second one countered.

const TEXT = "Whenever the first noncreature spell of a turn is cast, counter that spell.";

export default defineCard({
  name: "Nullstone Gargoyle",
  manaCost: "{9}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { notTypes: ["creature"] } },
      whileCondition: { kind: "cast-this-turn", who: "any", filter: { notTypes: ["creature"] }, atLeast: 1, atMost: 1 },
      targets: [],
      effect: { kind: "counter", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
