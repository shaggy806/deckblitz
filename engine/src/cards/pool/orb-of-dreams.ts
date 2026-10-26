import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 16930.
// "Permanents enter tapped": every other permanent, any controller's. The Orb
// itself isn't on the battlefield yet as it enters, so its own static doesn't
// apply to it — `others-enter-battlefield`.
const TEXT = "Permanents enter tapped.";

export default defineCard({
  name: "Orb of Dreams",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: {}, tapped: true },
      text: TEXT,
    },
  ],
});
