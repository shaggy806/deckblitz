import { defineCard } from "../define.js";

// EDHREC rank 16901. The −3 is Vivien of the Arkbow's one-sided fight: if
// either target is illegal as it resolves, no damage is dealt (the ruling).
// The −7 affects the Dinosaurs you control as it resolves (the ruling).

const YOUR_DINOSAUR = { kind: "permanent", whose: "you", filter: { subtype: "Dinosaur" } } as const;

export default defineCard({
  name: "Huatli, Dinosaur Knight",
  manaCost: "{4}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Huatli"],
  loyalty: 4,
  text: "+2: Put two +1/+1 counters on up to one target Dinosaur you control.\n−3: Target Dinosaur you control deals damage equal to its power to target creature you don't control.\n−7: Dinosaurs you control get +4/+4 until end of turn.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: YOUR_DINOSAUR }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "+2: Put two +1/+1 counters on up to one target Dinosaur you control.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [YOUR_DINOSAUR, "creature-an-opponent-controls"],
      effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      resolve: null,
      text: "−3: Target Dinosaur you control deals damage equal to its power to target creature you don't control.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { subtype: "Dinosaur", controlledBy: "you" },
        power: 4,
        toughness: 4,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "−7: Dinosaurs you control get +4/+4 until end of turn.",
    },
  ],
});
