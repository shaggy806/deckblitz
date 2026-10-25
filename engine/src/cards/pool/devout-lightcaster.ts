import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 26048. The enters trigger isn't optional: with
// only your own black permanent about, it must be targeted (the ruling).

export default defineCard({
  name: "Devout Lightcaster",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 2,
  text: "Protection from black\nWhen this creature enters, exile target black permanent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { colors: ["B"] } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature enters, exile target black permanent.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
