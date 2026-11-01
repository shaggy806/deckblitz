import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a nonlegendary creature spell with flying, you may copy it, except the copy is a 1/1 Spirit in addition to its other types. Do this only once each turn. (The copy becomes a token.)";

// "Except the copy is a 1/1 Spirit in addition to its other types" is a copy
// exception (rule 707.9b): base P/T 1/1 and the Spirit type are its copiable
// values, under every other effect, and the token it becomes keeps them.
// "Do this only once each turn" limits the copying, not the trigger
// (`oncePerTurn` on the `may`).
export default defineCard({
  name: "Donal, Herald of Wings",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { type: "creature", notSupertype: "legendary", keyword: "flying" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell, the copy a 1/1 Spirit in addition to its other types?",
        oncePerTurn: true,
        effect: {
          kind: "copy-spell",
          target: "trigger-spell",
          except: { basePt: [1, 1], addSubtypes: ["Spirit"] },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
