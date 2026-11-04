import { defineCard } from "../define.js";

// While suspended, the opponent who cast the spell may slow it down.
const TEXT = "Whenever an opponent casts a spell, if this card is suspended, that player may put a time counter on this card.";

export default defineCard({
  name: "Pardic Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  suspend: { n: 2, cost: "{R}{R}" },
  text: `Flying\n{R}: This creature gets +1/+0 until end of turn.\nSuspend 2—{R}{R} (Rather than cast this card from your hand, you may pay {R}{R} and exile it with two time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      whileSuspended: true,
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Put a time counter on Pardic Dragon?",
        effect: { kind: "add-counter", target: "source", counter: "time", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
