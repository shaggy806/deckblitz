/**
 * Aether Revolt, group R: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Pia's Revolution", () => {
  it("the targeted opponent may take 3 damage, and the artifact stays put", () => {
    const { game, a, b } = table();
    spawn(game, "Pia's Revolution");
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, B);
    pickModes(b, 0);
    destroy(game, ring);
    expect(life(game, B)).toBe(17);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("if they don't, the artifact card returns to its owner's hand", () => {
    const { game, a, b } = table();
    spawn(game, "Pia's Revolution");
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, B);
    pickModes(b, 1);
    destroy(game, ring);
    expect(life(game, B)).toBe(20);
    expect(hand(game)).toContain(ring);
  });

  it("doesn't trigger for an opponent's artifact", () => {
    const { game, a, b } = table();
    spawn(game, "Pia's Revolution");
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, B);
    pickModes(b, 0);
    destroy(game, ring, A);
    expect(life(game, B)).toBe(20);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Invigorated Rampage", () => {
  it("the second mode gives two creatures +2/+0 and trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Invigorated Rampage"), { modes: [1], targets: [ref(x), ref(y)] });
    expect(pt(game, x)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, y)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, y).has("trample")).toBe(true);
  });
});

describe("Siege Modification", () => {
  it("makes an enchanted Vehicle a creature, +3/+0 with first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const harvester = spawn(game, "Aethersphere Harvester");
    expect(types(game, harvester)).not.toContain("creature");
    cast(game, toHand(game, "Siege Modification"), { targets: [ref(harvester)] });
    expect(types(game, harvester)).toContain("creature");
    expect(pt(game, harvester)).toEqual({ power: 6, toughness: 5 });
    expect(keywords(game, harvester).has("first-strike")).toBe(true);
  });
});

describe("Tezzeret's Touch", () => {
  it("makes the artifact a 5/5 creature, and returns it to hand when it's put into a graveyard", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Tezzeret's Touch"), { targets: [ref(ring)] });
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 5 });
    destroy(game, ring);
    expect(hand(game)).toContain(ring);
  });
});

describe("Lifecraft Awakening", () => {
  it("a noncreature artifact becomes a 0/0 Construct artifact creature with the counters", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Lifecraft Awakening"), { x: 2, targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Construct");
    expect(pt(game, ring)).toEqual({ power: 2, toughness: 2 });
  });

  it("a Vehicle only gets the counters", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    const harvester = spawn(game, "Aethersphere Harvester");
    cast(game, toHand(game, "Lifecraft Awakening"), { x: 1, targets: [ref(harvester)] });
    expect(types(game, harvester)).not.toContain("creature");
    expect(counters(game, harvester)).toBe(1);
  });
});

describe("Quicksmith Rebel", () => {
  it("the artifact gains a {T}: 2 damage ability", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    pickTargets(a, thopter);
    enter(game, "Quicksmith Rebel");
    activate(game, thopter, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });

  it("loses it once the Rebel leaves", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    pickTargets(a, thopter);
    const rebel = enter(game, "Quicksmith Rebel");
    destroy(game, rebel);
    expect(() => activate(game, thopter, 0, { targets: [ref(B)] })).toThrow();
  });
});

describe("Crackdown Construct", () => {
  it("gets +1/+1 when you activate an artifact's ability", () => {
    const { game } = table();
    const construct = spawn(game, "Crackdown Construct");
    const harvester = spawn(game, "Aethersphere Harvester");
    game.state.players[A].energy = 1;
    activate(game, harvester, 0);
    expect(keywords(game, harvester).has("lifelink")).toBe(true);
    expect(game.state.players[A].energy).toBe(0);
    expect(pt(game, construct)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Aetherstream Leopard", () => {
  it("pays {E} as it attacks for +2/+0", () => {
    const { game, a } = table();
    const leopard = enter(game, "Aetherstream Leopard");
    expect(game.state.players[A].energy).toBe(1);
    pickModes(a, 0);
    attack(game, a, [leopard]);
    expect(game.state.players[A].energy).toBe(0);
    expect(life(game, B)).toBe(16);
  });
});

describe("Aether Swooper", () => {
  it("pays {E}{E} as it attacks for a Servo", () => {
    const { game, a } = table();
    const swooper = enter(game, "Aether Swooper");
    pickModes(a, 0);
    attack(game, a, [swooper]);
    expect(game.state.players[A].energy).toBe(0);
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
  });
});

describe("Midnight Entourage", () => {
  it("pumps other Aetherborn, and its own death draws a card and costs 1 life", () => {
    const { game } = table();
    const other = spawn(game, "Ambitious Aetherborn");
    const base = pt(game, other);
    const entourage = spawn(game, "Midnight Entourage");
    expect(pt(game, other)).toEqual({ power: base.power + 1, toughness: base.toughness + 1 });
    expect(pt(game, entourage)).toEqual({ power: 3, toughness: 3 });
    const before = hand(game).length;
    destroy(game, entourage);
    expect(hand(game)).toHaveLength(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Into the Night", () => {
  it("makes it night, and draws one more than it discarded", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.slice(0, 2).map((c) => c.id);
    cast(game, toHand(game, "Into the Night"));
    expect(game.state.dayNight).toBe("night");
    expect(graveyard(game, A)).toHaveLength(3);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Colossus of the Blood Age", () => {
  it("drains on entering, and its death with no discards draws one", () => {
    const { game, a } = table();
    const colossus = enter(game, "Colossus of the Blood Age");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    a.chooseDiscardsFn = () => [];
    const before = hand(game).length;
    destroy(game, colossus);
    expect(hand(game)).toHaveLength(before + 1);
  });
});
