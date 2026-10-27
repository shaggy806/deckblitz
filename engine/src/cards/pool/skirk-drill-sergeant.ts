import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 21848. "This creature or another Goblin" is
// written as two triggers, one on its own death and one on any other Goblin's
// (any player's): each death triggers exactly one of them, and this creature
// triggers on its own death whether or not it's still a Goblin.

const TEXT =
  "Whenever this creature or another Goblin dies, you may pay {2}{R}. If you do, reveal the top card of your library. If it's a Goblin permanent card, put it onto the battlefield. Otherwise, put it into your graveyard.";

const EFFECT: EffectSpec = {
  kind: "may",
  prompt: "Pay {2}{R} to reveal the top card of your library?",
  cost: "{2}{R}",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 1,
    reveal: true,
    min: 1,
    max: 1,
    filter: { subtype: "Goblin", notTypes: ["instant", "sorcery"] },
    destination: "battlefield",
    leftover: "graveyard",
  },
};

export default defineCard({
  name: "Skirk Drill Sergeant",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    { trigger: { on: "dies", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", subtype: "Goblin" }, otherOnly: true },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
