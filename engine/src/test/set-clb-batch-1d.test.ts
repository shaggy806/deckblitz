/**
 * Commander Legends: Battle for Baldur's Gate, group d. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Dread Linnorm // Scale Deflection", () => {
  it("Scale Deflection puts two counters on a tapped creature, untaps it and gives it hexproof; the Linnorm is cast from exile", () => {
    const { game } = table();
    lands(game, "Forest", 11);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const card = toHand(game, "Dread Linnorm");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
  });

  it("an untapped target still gets the counters and hexproof (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Dread Linnorm"), { face: 1, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });

  it("the Linnorm can't be blocked by creatures with power 3 or less", () => {
    const { game, a } = table();
    const linnorm = spawn(game, "Dread Linnorm");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const offer = blockOffer(game, a, [linnorm]);
    expect(canBlock(offer, giant)).toEqual([]);
    expect(canBlock(offer, wurm)).toEqual([linnorm]);
  });
});

describe("Livaan, Cultist of Tiamat", () => {
  it("a noncreature spell gives target creature +X/+0, X its mana value", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Livaan, Cultist of Tiamat");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Divination"));
    expect(seen.offered[0]).toContain(theirs);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("a creature spell doesn't trigger it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    spawn(game, "Livaan, Cultist of Tiamat");
    const seen = watchTargets(a);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(seen.asked).toBe(0);
  });
});

describe("Githzerai Monk", () => {
  it("taps all creatures you don't control, not yours", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    enter(game, "Githzerai Monk");
    expect(game.state.objects[mine].tapped).toBe(false);
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(true);
  });
});

describe("Drillworks Mole", () => {
  it("puts a counter on itself and on the target commander creature", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mole = spawn(game, "Drillworks Mole");
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const bears = spawn(game, "Grizzly Bears");
    activate(game, mole, 0, { targets: [ref(commander)] });
    expect(counters(game, mole)).toBe(1);
    expect(counters(game, commander)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("still counters the commander if the Mole has left (the ruling)", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mole = spawn(game, "Drillworks Mole");
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    activate(game, mole, 0, { targets: [ref(commander)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(mole)]);
    settle(game);
    expect(zone(game, mole)).toBe("graveyard");
    expect(counters(game, commander)).toBe(1);
  });

  it("with no target, only the Mole gets a counter", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mole = spawn(game, "Drillworks Mole");
    activate(game, mole, 0, { targets: [null] });
    expect(counters(game, mole)).toBe(1);
  });

  it("a target gone illegal means no counter on the Mole either (the ruling)", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mole = spawn(game, "Drillworks Mole");
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    activate(game, mole, 0, { targets: [ref(commander)], settle: false });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(commander)]);
    settle(game);
    expect(zone(game, commander)).not.toBe("battlefield");
    expect(counters(game, mole)).toBe(0);
  });

  it("a non-commander creature can't be targeted", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mole = spawn(game, "Drillworks Mole");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, mole, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Icewind Stalwart", () => {
  it("blinks a non-Warrior creature you control, which comes back without its counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const stalwart = enter(game, "Icewind Stalwart");
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(stalwart);
    expect(seen.offered[0]).not.toContain(theirs);
    const back = game.battlefield.find(
      (id) => game.state.objects[id].cardName === "Grizzly Bears" && game.state.objects[id].controller === A,
    );
    expect(back).toBeDefined();
    expect(counters(game, back!)).toBe(0);
  });
});

describe("Moonshae Pixie // Pixie Dust", () => {
  it("draws one card per opponent dealt combat damage this turn", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(18);
    const pixie = toHand(game, "Moonshae Pixie");
    const before = hand(game).length;
    cast(game, pixie);
    expect(zone(game, pixie)).toBe("battlefield");
    // The Pixie left the hand; one card came in (bob was hit, carol wasn't).
    expect(hand(game).length).toBe(before);
  });

  it("draws nothing when no opponent was dealt combat damage", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    const pixie = toHand(game, "Moonshae Pixie");
    const before = hand(game).length;
    cast(game, pixie);
    expect(hand(game).length).toBe(before - 1);
  });

  it("Pixie Dust gives up to three target creatures flying", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const [one, two, three] = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant"), spawn(game, "Grizzly Bears", B)];
    const card = toHand(game, "Moonshae Pixie");
    cast(game, card, { face: 1, targets: [ref(one), ref(two), ref(three)] });
    for (const id of [one, two, three]) expect(keywords(game, id).has("flying")).toBe(true);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Amethyst Dragon // Explosive Crystal", () => {
  it("Explosive Crystal deals 4 divided as chosen; the Dragon is then cast from exile with flying and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 11);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Amethyst Dragon");
    cast(game, card, { face: 1, targets: [ref(giant), ref(B)], division: [3, 1] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    expect(keywords(game, card).has("flying")).toBe(true);
    expect(keywords(game, card).has("haste")).toBe(true);
  });

  it("takes at most four targets", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const ids = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const card = toHand(game, "Amethyst Dragon");
    expect(() => cast(game, card, { face: 1, targets: [...ids.map(ref), ref(B), ref(A)] })).toThrow(/at most 4/);
  });
});

describe("Silvanus's Invoker", () => {
  it("untaps target land, which is an 8/8 trample haste Elemental land creature until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    spawn(game, "Silvanus's Invoker");
    const target = spawn(game, "Forest", A, { tapped: true });
    const invoker = game.battlefield.find((id) => game.state.objects[id].cardName === "Silvanus's Invoker")!;
    activate(game, invoker, 0, { targets: [ref(target)] });
    expect(game.state.objects[target].tapped).toBe(false);
    expect(pt(game, target)).toEqual({ power: 8, toughness: 8 });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, target)).toEqual(expect.arrayContaining(["Forest", "Elemental"]));
    expect(keywords(game, target).has("trample")).toBe(true);
    expect(keywords(game, target).has("haste")).toBe(true);
    toStep(game, "upkeep", B);
    expect(types(game, target)).not.toContain("creature");
  });
});

describe("Bhaal, Lord of Murder", () => {
  it("has indestructible only at half its controller's starting life or less", () => {
    const { game } = table();
    const bhaal = spawn(game, "Bhaal, Lord of Murder");
    game.state.players[A].life = 11;
    expect(keywords(game, bhaal).has("indestructible")).toBe(false);
    game.state.players[A].life = 10;
    expect(keywords(game, bhaal).has("indestructible")).toBe(true);
  });

  it("another nontoken creature of yours dying puts a counter on target creature and goads it", () => {
    const { game, a } = table();
    spawn(game, "Bhaal, Lord of Murder");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [theirs]);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([theirs, mine]));
    expect(counters(game, theirs)).toBe(1);
    expect(game.state.objects[theirs].goadedBy).toContain(A);
  });

  it("a token dying doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Bhaal, Lord of Murder");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken)!;
    const seen = watchTargets(a);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(token)]);
    settle(game);
    expect(seen.asked).toBe(0);
  });
});

describe("Mystery Key", () => {
  it("equipped creature's combat damage to a player sacrifices the Key and draws three", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const key = spawn(game, "Mystery Key");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, key, 0, { targets: [ref(bears)] });
    expect(game.state.objects[key].attachedTo).toBe(bears);
    const before = hand(game).length;
    attack(game, a, [bears], B);
    settle(game);
    expect(zone(game, key)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Earth Tremor", () => {
  it("deals damage equal to the lands you control to target creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    const jace = spawn(game, "Jace Beleren", B);
    cast(game, toHand(game, "Earth Tremor"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    // A planeswalker is a legal target too (eight lands now, against a
    // 3-loyalty Jace).
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Earth Tremor"), { targets: [ref(jace)] });
    expect(zone(game, jace)).toBe("graveyard");
  });

  it("can't target a player", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    expect(() => cast(game, toHand(game, "Earth Tremor"), { targets: [ref(B)] })).toThrow();
  });
});

describe("Saddle of the Cavalier", () => {
  it("gives +3/+3 and can't be blocked by creatures with power 3 or less", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const saddle = spawn(game, "Saddle of the Cavalier");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, saddle, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, giant)).toEqual([]);
    expect(canBlock(offer, wurm)).toEqual([bears]);
  });
});

describe("Kenku Artificer", () => {
  it("makes a noncreature artifact a 3/3 flying Homunculus artifact creature that keeps its abilities", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Kenku Artificer");
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).not.toContain(bears);
    expect(counters(game, ring)).toBe(3);
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Homunculus");
    expect(keywords(game, ring).has("flying")).toBe(true);
    // It stays a creature past this turn.
    toStep(game, "upkeep", B);
    expect(types(game, ring)).toContain("creature");
  });

  it("an attached Equipment becomes unattached (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, splitter, 0, { targets: [ref(bears)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bears);
    pickTargets(a, splitter);
    enter(game, "Kenku Artificer");
    expect(types(game, splitter)).toContain("creature");
    expect(game.state.objects[splitter].attachedTo ?? null).toBeNull();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
