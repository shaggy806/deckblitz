/**
 * Reality Fracture (FRA) and its Commander set (FRC), batch 3, part b (2026-10-14): the bottom
 * half of the set. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const jaceToken = (game: Game, player = A): ObjectId => {
  const [jace] = named(game, "Jace Token", player);
  if (jace === undefined) throw new Error(`${player} has no Jace token`);
  return jace;
};

describe("Way of the Wildspeaker", () => {
  it("empowers Jace 7, and planeswalkers you control have −4: a 4/4 trampling Beast", () => {
    const { game } = table();
    enter(game, "Way of the Wildspeaker");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(7);
    toStep(game, "postcombat-main");
    // The Jace token's two printed abilities come first; the granted one is third.
    activate(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(3);
    const [beast] = named(game, "Beast Token (Garruk, Veiled Butcher)", A);
    expect(beast).toBeDefined();
    expect(pt(game, beast)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, beast).has("trample")).toBe(true);
  });
});

describe("Karn, Argent Defender", () => {
  it("stops artifacts and creatures entering from causing triggers, but not other lands", () => {
    const { game } = table();
    spawn(game, "Karn, Argent Defender");
    spawn(game, "Eumidian Terrabotanist"); // Landfall — gain 1 life.
    enter(game, "Arcane Amphisbaena"); // a creature's own "when this enters"
    expect(named(game, "Jace Token", A)).toHaveLength(0);
    const cards = hand(game).length;
    enter(game, "Ichor Wellspring"); // a noncreature artifact's own enters trigger
    expect(hand(game)).toHaveLength(cards);
    const before = life(game);
    enter(game, "Forest");
    expect(life(game)).toBe(before + 1);
  });
});

describe("Perfected Theory", () => {
  it("sets a creature's base power and toughness to 4/5, with counters still on top", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 1;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Perfected Theory"), { modes: [1], targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Traxos, Scourge Eternal", () => {
  it("stays tapped through your untap step, and untaps when you cast an artifact or creature spell", () => {
    const { game } = table();
    const traxos = spawn(game, "Traxos, Scourge Eternal", A, { tapped: true });
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main");
    expect(game.state.objects[traxos].tapped).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.objects[traxos].tapped).toBe(true);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    expect(game.state.objects[traxos].tapped).toBe(false);
  });
});

describe("Craftwork Crusher", () => {
  it("chooses two modes as it triggers: 4 damage to a creature and a card", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0, 2);
    pickTargets(a, giant);
    const cards = hand(game).length;
    enter(game, "Craftwork Crusher");
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game)).toHaveLength(cards + 1);
    expect(tokensNamed(game, "Cadet", A)).toBe(0);
  });
});

describe("Inspired Tethermage", () => {
  it("grows when a loyalty ability's plus cost puts loyalty counters on your planeswalker", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Beleren");
    settle(game);
    const mage = spawn(game, "Inspired Tethermage");
    loyalty(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(5);
    expect(counters(game, mage)).toBe(1);
    // A planeswalker entering under your control with its loyalty counters had them put on it too (rule 122.6).
    enter(game, "Garruk Wildspeaker");
    expect(counters(game, mage)).toBe(2);
    // A minus cost puts none.
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main");
    loyalty(game, jace, -1, { targets: [ref(A)] });
    expect(counters(game, mage)).toBe(2);
  });

  it("grows from its own empower Jace, but not from an opponent's planeswalker gaining loyalty", () => {
    const { game } = table();
    const mage = spawn(game, "Inspired Tethermage");
    lands(game, "Forest", 6);
    activate(game, mage, 0);
    expect(counters(game, jaceToken(game), "loyalty")).toBe(2);
    expect(counters(game, mage)).toBe(1);
    const theirs = spawn(game, "Jace Beleren", B);
    game.state.objects[theirs].counters.loyalty = 3;
    toStep(game, "precombat-main", B);
    loyalty(game, theirs, 2, { player: B });
    expect(counters(game, mage)).toBe(1);
  });
});

describe("Tam's Resistance", () => {
  it("counters and vigilance on up to one creature, then empower Jace 4 — even with no target", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Tam's Resistance"), { targets: [ref(bear)] });
    expect(counters(game, bear)).toBe(1);
    expect(keywords(game, bear).has("vigilance")).toBe(true);
    expect(counters(game, jaceToken(game), "loyalty")).toBe(4);

    cast(game, toHand(game, "Tam's Resistance"), { targets: [null] });
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, jaceToken(game), "loyalty")).toBe(8);
  });
});

describe("Precise Redaction", () => {
  it("counters a white spell and can't target a green one", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const lions = toHand(game, "Savannah Lions");
    cast(game, lions, { settle: false });
    cast(game, toHand(game, "Precise Redaction"), { targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("graveyard");

    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(() => cast(game, toHand(game, "Precise Redaction"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Terminal Criticism", () => {
  it("destroys a red creature and gains 1 life; a green one isn't a legal target", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    expect(() => cast(game, toHand(game, "Terminal Criticism"), { targets: [ref(bear)] })).toThrow();
    const before = life(game);
    cast(game, toHand(game, "Terminal Criticism"), { targets: [ref(dragon)] });
    expect(zone(game, dragon)).toBe("graveyard");
    expect(life(game)).toBe(before + 1);
  });
});

describe("Flourishing Grapple", () => {
  it("strips the white creature's abilities, then your creature deals damage equal to its power to it", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Flourishing Grapple"), { targets: [ref(angel), ref(giant)] });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(game.state.objects[angel].damageMarked).toBe(3);
    // One-sided: the Angel deals nothing back.
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("can't target a green creature", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 1);
    expect(() =>
      cast(game, toHand(game, "Flourishing Grapple"), { targets: [ref(bear), ref(giant)] }),
    ).toThrow();
  });
});

describe("Eardrum Rattler", () => {
  it("makes another creature you control with power 2 or less unblockable — not itself, not a bigger one", () => {
    const { game } = table();
    const rattler = spawn(game, "Eardrum Rattler");
    const giant = spawn(game, "Hill Giant");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    expect(() => activate(game, rattler, 0, { targets: [ref(rattler)] })).toThrow();
    expect(() => activate(game, rattler, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, rattler, 0, { targets: [ref(bear)] });
    expect(keywords(game, bear).has("unblockable")).toBe(true);
  });
});

describe("Puppet Crafting", () => {
  it("makes an enchanted artifact a 5/5 Construct creature, and returns from the graveyard to hand", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Puppet Crafting"), { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Construct");
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 5 });

    const dead = toGraveyard(game, "Puppet Crafting");
    activate(game, dead, 0);
    expect(zone(game, dead)).toBe("hand");
  });
});
