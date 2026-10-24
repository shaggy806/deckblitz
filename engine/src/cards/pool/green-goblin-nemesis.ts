import { defineCard } from "../define.js";

// EDHREC rank 7917. Surly Badgersaur's per-card discard triggers.

const NONLAND_TEXT = "Whenever you discard a nonland card, put a +1/+1 counter on target Goblin you control.";
const LAND_TEXT = "Whenever you discard a land card, create a tapped Treasure token.";

export default defineCard({
  name: "Green Goblin, Nemesis",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Human", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${NONLAND_TEXT}\n${LAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true, filter: { notTypes: ["land"] } },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Goblin" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: NONLAND_TEXT,
    },
    {
      trigger: { on: "discards", who: "you", perCard: true, filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
      resolve: null,
      text: LAND_TEXT,
    },
  ],
});
