import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 29665.
//
// Rulings:
//   [2006-07-15] If either Stalking Yeti or the targeted creature is no longer on the battlefield
//     when the "enters" triggered ability resolves, the ability does nothing.
//
// "If it's on the battlefield" is an intervening if (rule 603.4); a gone
// target leaves the ability with no legal target (rule 608.2b).
const ENTERS =
  "When this creature enters, if it's on the battlefield, it deals damage equal to its power to target creature an opponent controls and that creature deals damage equal to its power to this creature.";
const BOUNCE =
  "{2}{S}: Return this creature to its owner's hand. Activate only as a sorcery. ({S} can be paid with one mana from a snow source.)";

export default defineCard({
  name: "Stalking Yeti",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 3,
  text: `${ENTERS}\n${BOUNCE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // The intervening if holds as it triggers (it just entered); only its
      // check on resolution can fail, which is this conditional.
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: { powerOf: "source" }, target: 0 },
            { kind: "fight", a: 0, b: "source", oneSided: true },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{S}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      sorcerySpeed: true,
      text: BOUNCE,
    },
  ],
});
