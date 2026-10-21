import { defineCard } from "../define.js";

// EDHREC rank 20526. Dominaria.
//
// Rulings:
//   [2018-04-27] If Hallar leaves the battlefield after its last ability has triggered but before
//     it resolves, you don't put a +1/+1 counter on anything as the ability resolves, but you do
//     use the number of +1/+1 counters that were on Hallar before it left the battlefield to
//     determine how much damage it deals to each opponent.
//   [2018-04-27] Hallar's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered.
//
// "If that spell was kicked" is the cast filter `kicked` (a spell's kicked
// status never changes once it's cast). The damage reads the +1/+1 counters
// on Hallar, as it last existed if it has left (Herald of Ilharg's shape).

const TEXT =
  "Whenever you cast a spell, if that spell was kicked, put a +1/+1 counter on Hallar, then Hallar deals damage equal to the number of +1/+1 counters on it to each opponent.";

export default defineCard({
  name: "Hallar, the Firefletcher",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
