import { defineCard } from "../define.js";

// "Protection from God creatures" — a creature that's a God (a God that isn't
// a creature at the moment isn't one, its ruling), as a protection filter.

export default defineCard({
  name: "Sigrid, God-Favored",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "first-strike"],
  text: "Flash\nFirst strike, protection from God creatures\nWhen Sigrid enters, exile up to one target attacking or blocking creature until Sigrid leaves the battlefield.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "attacking-or-blocking-creature" }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: "When Sigrid enters, exile up to one target attacking or blocking creature until Sigrid leaves the battlefield.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { type: "creature", subtype: "God" } },
      text: "Protection from God creatures",
    },
  ],
});
