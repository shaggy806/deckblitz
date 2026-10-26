import { defineCard } from "../define.js";

// EDHREC rank 13104.
//
// Rulings:
//   Damage that can't be prevented is dealt as normal and puts no -1/-1
//     counters on it (the replacement only acts on damage it prevents).
//   Anti-Venom's and Stormwild Capridor's prevent-then-counters shape, with
//     -1/-1 counters, for any damage (combat or not).

const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Put a -1/-1 counter on this creature for each 1 damage prevented this way.";

export default defineCard({
  name: "Phyrexian Hydra",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Hydra"],
  power: 7,
  toughness: 7,
  keywords: ["infect"],
  text: `Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "add-counter", target: "source", counter: "-1/-1", amount: "x" },
      },
      text: PREVENT_TEXT,
    },
  ],
});
