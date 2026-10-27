import { defineCard } from "../define.js";

// EDHREC rank 27216. Shaman en-Kor's redirection, with "you" as the
// protected recipient (Pentagram of the Ages' shape).

const TEXT =
  "{T}: The next time a source of your choice would deal damage to you this turn, that damage is dealt to this creature instead.";

export default defineCard({
  name: "Beacon of Destiny",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time", redirectTo: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
