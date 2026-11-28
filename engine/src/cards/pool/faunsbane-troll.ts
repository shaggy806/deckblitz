import { defineCard } from "../define.js";

// Wilds of Eldraine Commander.
//
// "Sacrifice an Aura attached to this creature" is a sacrifice cost whose
// filter reads the source (`attachedTo: { isSource: true }`): any Aura you
// control on it, its Monster Role or another (rule 701.21a — only your own).
// The exile rider is Agate Assault's `exile-if-dies-this-turn` on the target.

const ENTERS =
  "When this creature enters, create a Monster Role token attached to it. (Enchanted creature gets +1/+1 and has trample.)";
const FIGHT =
  "{1}, Sacrifice an Aura attached to this creature: This creature fights target creature you don't control. If that creature would die this turn, exile it instead. Activate only as a sorcery.";

export default defineCard({
  name: "Faunsbane Troll",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n${FIGHT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Aura", attachedTo: { isSource: true } } } },
      // "You don't control": the opponents' (rule 102.3), as Thorn Mammoth's.
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "fight", a: "source", b: 0 },
          { kind: "exile-if-dies-this-turn", target: 0 },
        ],
      },
      resolve: null,
      sorcerySpeed: true,
      text: FIGHT,
    },
  ],
});
