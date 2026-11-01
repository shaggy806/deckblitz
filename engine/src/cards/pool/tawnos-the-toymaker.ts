import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a Beast or Bird creature spell, you may copy it, except the copy is an artifact in addition to its other types. (The copy becomes a token.)";

// "Except the copy is an artifact in addition to its other types" is a copy
// exception (rule 707.9b): part of the copy's copiable values, kept by the
// token it becomes.
export default defineCard({
  name: "Tawnos, the Toymaker",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", subtypes: ["Beast", "Bird"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell, the copy an artifact in addition to its other types?",
        effect: { kind: "copy-spell", target: "trigger-spell", except: { addTypes: ["artifact"] } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
