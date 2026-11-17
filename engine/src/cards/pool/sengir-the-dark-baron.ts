import { defineCard } from "../define.js";

// EDHREC rank 11384.
//
// Rulings:
//   If you and another player lose the game at the same time, the third
//   ability won't resolve in time to save you.
//   The third ability triggers however the player lost the game.
//
// "Another player" is an opponent (the pool's reading: no teams). The life
// total is the one that player had as the turn began, before its untap step
// (`JournalTurn.began`), kept after they leave the game (rule 800.4a).
const DIES_TEXT = "Whenever another creature dies, put two +1/+1 counters on Sengir.";
const LOSES_TEXT =
  "Whenever another player loses the game, you gain life equal to that player's life total as the turn began.";

export default defineCard({
  name: "Sengir, the Dark Baron",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: `Flying\n${DIES_TEXT}\n${LOSES_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "event", event: "loses-game", who: "opponent" },
      targets: [],
      effect: { kind: "gain-life", amount: { turnStat: "life-as-turn-began", who: "trigger-player" } },
      resolve: null,
      text: LOSES_TEXT,
    },
  ],
});
