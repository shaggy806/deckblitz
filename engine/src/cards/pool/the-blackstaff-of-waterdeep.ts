import { defineCard } from "../define.js";

// EDHREC rank 20434.

const UNTAP_TEXT = "You may choose not to untap The Blackstaff of Waterdeep during your untap step.";

export default defineCard({
  name: "The Blackstaff of Waterdeep",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "You may choose not to untap The Blackstaff of Waterdeep during your untap step.\nAnimate Walking Statue \u2014 {1}{U}, {T}: Another target nontoken artifact you control becomes a 4/4 artifact creature for as long as The Blackstaff of Waterdeep remains tapped. Activate only as a sorcery.",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact", token: false } } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "while-source-tapped",
      },
      sorcerySpeed: true,
      resolve: null,
      text: "Animate Walking Statue \u2014 {1}{U}, {T}: Another target nontoken artifact you control becomes a 4/4 artifact creature for as long as The Blackstaff of Waterdeep remains tapped. Activate only as a sorcery.",
    },
  ],
});
