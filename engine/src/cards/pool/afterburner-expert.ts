import { defineCard } from "../define.js";

// Aetherdrift (DFT). The return works only from your graveyard (rule
// 113.6k — `fromGraveyard`): any exhaust ability you activate, of any
// permanent, a granted one included, triggers it, and it resolves before that
// exhaust ability does (the ruling).
//
// Rulings:
//   If an ability triggers whenever you activate an exhaust ability, that ability resolves before
//     the exhaust ability resolves.

const EXHAUST = "Exhaust — {2}{G}{G}: Put two +1/+1 counters on this creature.";
const RETURN = "Whenever you activate an exhaust ability, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Afterburner Expert",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 4,
  toughness: 2,
  text: `${EXHAUST} (Activate each exhaust ability only once.)\n${RETURN}`,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: EXHAUST,
      exhaust: true,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "activates-ability", who: "you", exhaust: true },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN,
    },
  ],
});
