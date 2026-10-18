import { defineCard } from "../define.js";

const POISON_TEXT =
  "Whenever a creature you control with toxic deals combat damage to a player, that player gets an additional poison counter.";
const DEATHTOUCH_TEXT = "{1}{B}{G}: Target creature you control with toxic gains deathtouch until end of turn.";

export default defineCard({
  name: "Necrogen Rotpriest",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Cleric"],
  power: 1,
  toughness: 5,
  toxic: 2,
  text: `Toxic 2 (Players dealt combat damage by this creature also get two poison counters.)\n${POISON_TEXT}\n${DEATHTOUCH_TEXT}`,
  triggered: [
    {
      // Toxic printed or granted, read as the damage is dealt.
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", hasToxic: true },
      },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
      resolve: null,
      text: POISON_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", hasToxic: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH_TEXT,
    },
  ],
});
