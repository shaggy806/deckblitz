/**
 * Odyssey (ODY; B231), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const threshold = (game: ReturnType<typeof table>["game"]): void => {
  for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
};

describe("Unifying Theory", () => {
  it("the caster may pay {2} to draw a card", () => {
    const { game, a } = table();
    spawn(game, "Unifying Theory");
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    const shock = toHand(game, "Shock");
    const before = hand(game, A).length;
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Shock left the hand, the draw came back.
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Sphere of Law", () => {
  it("prevents 2 of a red source's damage to you", () => {
    const { game } = table();
    spawn(game, "Sphere of Law");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
  });

  it("Sphere of Grace leaves red damage alone", () => {
    const { game } = table();
    spawn(game, "Sphere of Grace");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
  });
});

describe("Wayward Angel", () => {
  it("with threshold is a black 7/7 with trample", () => {
    const { game } = table();
    const angel = spawn(game, "Wayward Angel");
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    threshold(game);
    expect(pt(game, angel)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, angel).has("trample")).toBe(true);
    expect([...computeCharacteristics(game.state, registryOf(game), angel).colors]).toEqual(["B"]);
  });
});

describe("Thermal Blast", () => {
  it("deals 3, or 5 with threshold", () => {
    const { game } = table();
    lands(game, "Mountain", 10);
    const first = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Thermal Blast"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("battlefield");
    threshold(game);
    const second = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Thermal Blast"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Krosan Avenger", () => {
  it("regenerates only with threshold", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const avenger = spawn(game, "Krosan Avenger");
    expect(() => activate(game, avenger)).toThrow();
    threshold(game);
    activate(game, avenger);
  });
});

describe("Patriarch's Desire", () => {
  it("gives +2/-2, and another +2/-2 with threshold", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Patriarch's Desire"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 8, toughness: 2 });
    threshold(game);
    expect(pt(game, wurm)).toEqual({ power: 10, toughness: 0 });
  });
});

describe("Otarian Juggernaut", () => {
  it("gets +3/+0 with threshold", () => {
    const { game } = table();
    const jugg = spawn(game, "Otarian Juggernaut");
    threshold(game);
    expect(pt(game, jugg)).toEqual({ power: 5, toughness: 3 });
  });
});
