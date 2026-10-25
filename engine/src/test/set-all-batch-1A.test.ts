/**
 * Alliances, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Gorilla Shaman", () => {
  it("X = 1 ({3}) destroys a mana value 1 noncreature artifact", () => {
    const { game } = table();
    const shaman = spawn(game, "Gorilla Shaman");
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    activate(game, shaman, 0, { x: 1, targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("can't target an artifact whose mana value isn't X", () => {
    const { game } = table();
    const shaman = spawn(game, "Gorilla Shaman");
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    expect(() => activate(game, shaman, 0, { x: 0, targets: [ref(ring)] })).toThrow();
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Gorilla War Cry", () => {
  it("can't be cast in a main phase", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Gorilla War Cry"))).toThrow();
  });
});

describe("Royal Decree and Keeper of Tresserhorn", () => {
  it("a black attacker tapping costs its controller 1; unblocked, the Keeper deals no combat damage and drains 2", () => {
    const { game, a } = table();
    spawn(game, "Royal Decree", B);
    const keeper = spawn(game, "Keeper of Tresserhorn");
    attack(game, a, [keeper]);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(18);
  });
});

describe("Rogue Skycaptain", () => {
  it("paid, it keeps a wage counter; unpaid, the counters come off and the opponent takes it", () => {
    const { game, a } = table();
    const captain = spawn(game, "Rogue Skycaptain");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, captain, "wage")).toBe(1);
    expect(controller(game, captain)).toBe(A);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, captain)).toBe(B);
    expect(counters(game, captain, "wage")).toBe(0);
  });
});

describe("Gargantuan Gorilla", () => {
  it("with no Forest to sacrifice, saying yes still sacrifices it and deals 7 to you", () => {
    const { game, a } = table();
    const gorilla = spawn(game, "Gargantuan Gorilla");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, gorilla)).toBe("graveyard");
    expect(life(game, A)).toBe(13);
  });

  it("a snow Forest sacrificed gives it trample", () => {
    const { game, a } = table();
    const gorilla = spawn(game, "Gargantuan Gorilla");
    const [forest] = lands(game, "Snow-Covered Forest", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, gorilla)).toBe("battlefield");
    expect(keywords(game, gorilla).has("trample")).toBe(true);
    expect(life(game, A)).toBe(20);
  });

  it("a plain Forest keeps it, without trample", () => {
    const { game, a } = table();
    const gorilla = spawn(game, "Gargantuan Gorilla");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, gorilla)).toBe("battlefield");
    expect(keywords(game, gorilla).has("trample")).toBe(false);
  });

  it("the tap ability deals damage both ways", () => {
    const { game } = table();
    const gorilla = spawn(game, "Gargantuan Gorilla");
    const other = spawn(game, "Gargantuan Gorilla", B);
    activate(game, gorilla, 0, { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, gorilla)).toBe("graveyard");
  });
});

describe("Juniper Order Advocate", () => {
  it("pumps green creatures you control only while untapped", () => {
    const { game } = table();
    spawn(game, "Juniper Order Advocate");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const other = table();
    spawn(other.game, "Juniper Order Advocate", A, { tapped: true });
    const bears2 = spawn(other.game, "Grizzly Bears");
    expect(pt(other.game, bears2)).toEqual({ power: 2, toughness: 2 });
  });
});
