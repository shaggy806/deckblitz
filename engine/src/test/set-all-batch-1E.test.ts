/**
 * The set walk, Alliances (ALL) group E: Phelddagrif and Lord of Tresserhorn.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  enter,
  hand,
  keywords,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  spawn,
  table,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Phelddagrif", () => {
  it("{G}: gains trample, and the target opponent creates the 1/1 Hippo", () => {
    const { game } = table({ players: 3 });
    const grif = spawn(game, "Phelddagrif");
    spawn(game, "Forest");
    activate(game, grif, 0, { targets: [ref(C)] });
    expect(keywords(game, grif).has("trample")).toBe(true);
    expect(tokensNamed(game, "1/1 Green Hippo Token", C)).toBe(1);
    expect(tokensNamed(game, "1/1 Green Hippo Token", B)).toBe(0);
    expect(tokensNamed(game, "1/1 Green Hippo Token", A)).toBe(0);
  });

  it("{W}: gains flying, and the target opponent gains 2 life", () => {
    const { game } = table();
    const grif = spawn(game, "Phelddagrif");
    spawn(game, "Plains");
    activate(game, grif, 1, { targets: [ref(B)] });
    expect(keywords(game, grif).has("flying")).toBe(true);
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
  });

  it("{U}: returns to hand, and the target opponent may draw — their choice", () => {
    const { game, b } = table();
    const grif = spawn(game, "Phelddagrif");
    spawn(game, "Island");
    spawn(game, "Island");
    const bobs = hand(game, B).length;
    pickModes(b, 0);
    activate(game, grif, 2, { targets: [ref(B)] });
    expect(zone(game, grif)).toBe("hand");
    expect(hand(game, B).length).toBe(bobs + 1);

    const again = spawn(game, "Phelddagrif");
    pickModes(b);
    activate(game, again, 2, { targets: [ref(B)] });
    expect(zone(game, again)).toBe("hand");
    expect(hand(game, B).length).toBe(bobs + 1);
  });
});

describe("Lord of Tresserhorn", () => {
  it("you lose 2 life, sacrifice the two creatures you choose, and the target opponent draws two", () => {
    const { game, a } = table({ players: 3 });
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const kept = spawn(game, "Grizzly Bears");
    const carols = hand(game, C).length;
    const bobs = hand(game, B).length;
    pickTargets(a, C);
    pickPermanents(a, bear, other);
    const lord = enter(game, "Lord of Tresserhorn");
    expect(life(game, A)).toBe(18);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, kept)).toBe("battlefield");
    expect(zone(game, lord)).toBe("battlefield");
    expect(hand(game, C).length).toBe(carols + 2);
    expect(hand(game, B).length).toBe(bobs);
  });

  it("with only one other creature, the Lord itself is sacrificed", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    const lord = enter(game, "Lord of Tresserhorn");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, lord)).toBe("graveyard");
  });
});
