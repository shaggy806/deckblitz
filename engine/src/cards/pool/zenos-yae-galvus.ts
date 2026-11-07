import { defineCard } from "../define.js";

// Final Fantasy (FIN). The front face of Zenos yae Galvus // Shinryu,
// Transcendent Rival.
//
// "Choose a creature an opponent controls" is made as the enters ability
// resolves — not a target — and kept as Zenos's chosen creature
// (`choose-permanents { remember }`, `GameObject.chosenPermanent`), which the
// second ability names (`who: "chosen"`). The -2/-2 spares the one chosen in
// this resolution (`thisWay: "chosen"`) even if Zenos has left by then; with
// no creature to choose, every other creature still gets it (the ruling).
// A chosen creature that leaves and comes back is a new object the choice no
// longer names (rule 400.7).

const MY_FIRST_FRIEND =
  "My First Friend — When Zenos yae Galvus enters, choose a creature an opponent controls. Until end of turn, creatures other than Zenos yae Galvus and the chosen creature get -2/-2.";
const LEAVES = "When the chosen creature leaves the battlefield, transform Zenos yae Galvus.";

export default defineCard({
  name: "Zenos yae Galvus",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Noble", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${MY_FIRST_FRIEND}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "opponent" },
            min: 1,
            upTo: 1,
            remember: true,
            then: { kind: "sequence", effects: [] },
            prompt: "Choose a creature an opponent controls",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", not: { thisWay: "chosen" } },
            exceptSource: true,
            power: -2,
            toughness: -2,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: MY_FIRST_FRIEND,
    },
    {
      trigger: { on: "leaves-battlefield", who: "chosen" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: LEAVES,
    },
  ],
  faces: ["Zenos yae Galvus", "Shinryu, Transcendent Rival"],
  transform: true,
});
