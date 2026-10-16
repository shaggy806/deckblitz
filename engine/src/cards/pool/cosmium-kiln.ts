import { defineCard } from "../define.js";

const ENTER_TEXT = "When this artifact enters, create two 1/1 colorless Gnome artifact creature tokens.";
const ANTHEM_TEXT = "Creatures you control get +1/+1.";

export default defineCard({
  name: "Cosmium Kiln",
  art: "https://cards.scryfall.io/art_crop/back/8/a/8aece300-656b-4e0d-a45f-aa7feaff0a4e.jpg",
  colors: ["W"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
  faces: ["Clay-Fired Bricks", "Cosmium Kiln"],
  transform: true,
});
