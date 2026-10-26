import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] Lunk Errant "attacks alone" if it's the only creature declared as an attacker as
//     the declare attackers step begins. The ability won't trigger if Lunk Errant and some other
//     creatures are declared as attackers, then those other creatures leave the battlefield or are
//     otherwise removed from combat. The ability also won't trigger if Lunk Errant is put onto the
//     battlefield attacking, even if no other creatures are attacking at that time.

const TRIGGER_TEXT = "Whenever this creature attacks alone, it gets +1/+1 and gains trample until end of turn.";

export default defineCard({
  name: "Lunk Errant",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
