import { defineCard } from "../define.js";

// Dragons of Tarkir (DTK). EDHREC rank 29225. Draconic Roar's optional
// Dragon reveal (`keyword: "reveal"`, `orControls`); the counter is a
// replacement as it enters, read off its spell having been kicked (Aether
// Figment's shape).

const COUNTER_TEXT =
  "This creature enters with a +1/+1 counter on it if you revealed a Dragon card or controlled a Dragon as you cast this spell.";

export default defineCard({
  name: "Scaleguard Sentinels",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
  },
  text: `As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: COUNTER_TEXT,
    },
  ],
});
