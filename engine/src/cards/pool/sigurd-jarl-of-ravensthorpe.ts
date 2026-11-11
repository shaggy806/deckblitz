import { defineCard } from "../define.js";

// Rulings:
//   Putting a lore counter on a Saga will usually cause the next chapter ability to trigger.
//   If an effect adds additional combat phases to a turn and a creature with a boast ability
//     attacks more than once during that turn, its boast ability can still be activated only once.

const BOAST =
  "Boast — {1}: Put a lore counter on target Saga you control or remove one from it. (Activate only if this creature attacked this turn and only once each turn.)";
const TRIGGER =
  "Whenever you put a lore counter on a Saga you control, put a +1/+1 counter on up to one other target creature.";

export default defineCard({
  name: "Sigurd, Jarl of Ravensthorpe",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "trample", "lifelink"],
  text: `Vigilance, trample, lifelink\n${BOAST}\n${TRIGGER}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      boast: true,
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Saga" } }],
      // Which of the two is chosen as the ability resolves.
      effect: {
        kind: "each-player-may",
        who: "you",
        choices: [
          {
            text: "Put a lore counter on the Saga.",
            effect: { kind: "add-counter", target: 0, counter: "lore", amount: 1 },
          },
          {
            text: "Remove a lore counter from the Saga.",
            effect: { kind: "remove-counter", target: 0, counter: "lore", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: BOAST,
    },
  ],
  triggered: [
    {
      // Once per lore counter put (rule 603.2c).
      trigger: {
        on: "counters-put",
        who: "you-control",
        filter: { subtype: "Saga" },
        counter: "lore",
        byYou: true,
        perCounter: true,
      },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
